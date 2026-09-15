const prisma = require('../utils/prisma');
const { generateOrderToken } = require('../utils/tokenGenerator');

const createOrder = async (req, res, next) => {
  try {
    const { pickupTime, specialInstructions } = req.body;

    if (!pickupTime) {
      return res.status(400).json({ success: false, message: 'Pickup time is required.' });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { foodItem: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Validate all items are still available
    const unavailable = cartItems.filter((ci) => !ci.foodItem.isAvailable);
    if (unavailable.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are no longer available: ${unavailable.map((ci) => ci.foodItem.name).join(', ')}`,
      });
    }

    const totalAmount = cartItems.reduce((sum, ci) => sum + ci.foodItem.price * ci.quantity, 0);
    const maxPrepTime = Math.max(...cartItems.map((ci) => ci.foodItem.prepTimeMinutes));
    const estimatedPrepTime = maxPrepTime + Math.ceil(cartItems.reduce((s, ci) => s + ci.quantity, 0) * 1.5);

    // Generate unique token (retry on collision)
    let token;
    let attempts = 0;
    do {
      token = generateOrderToken();
      const existing = await prisma.order.findUnique({ where: { token } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    // Create order and items atomically, then clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          token,
          userId: req.user.id,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          pickupTime: new Date(pickupTime),
          estimatedPrepTime,
          specialInstructions,
          items: {
            create: cartItems.map((ci) => ({
              foodItemId: ci.foodItemId,
              quantity: ci.quantity,
              unitPrice: ci.foodItem.price,
            })),
          },
        },
        include: {
          items: { include: { foodItem: true } },
          user: { select: { name: true, email: true, studentId: true } },
        },
      });

      // Clear cart after successful order
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status.toUpperCase();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: { include: { foodItem: { select: { name: true, image: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        items: { include: { foodItem: true } },
        user: { select: { name: true, email: true, studentId: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const trackByToken = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { token: req.params.token },
      include: {
        items: { include: { foodItem: { select: { name: true, image: true, prepTimeMinutes: true } } } },
        user: { select: { name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with this token.' });
    }

    // Only the order owner can track
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Calculate progress percentage
    const statusProgress = { PENDING: 10, ACCEPTED: 30, PREPARING: 60, READY: 90, COLLECTED: 100, CANCELLED: 0 };
    const progress = statusProgress[order.status] || 0;

    // Estimate time remaining
    const now = new Date();
    const pickupTime = new Date(order.pickupTime);
    const minutesUntilPickup = Math.max(0, Math.round((pickupTime - now) / 60000));

    res.json({
      success: true,
      order,
      tracking: {
        progress,
        minutesUntilPickup,
        statusMessage: getStatusMessage(order.status),
        estimatedReadyTime: order.status === 'PREPARING'
          ? new Date(now.getTime() + order.estimatedPrepTime * 60000).toISOString()
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['PENDING'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order can only be cancelled while pending.' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    res.json({ success: true, message: 'Order cancelled.', order: updated });
  } catch (error) {
    next(error);
  }
};

function getStatusMessage(status) {
  const messages = {
    PENDING: 'Your order has been placed and is waiting for confirmation.',
    ACCEPTED: 'Your order has been accepted by the canteen.',
    PREPARING: 'Your food is being prepared in the kitchen.',
    READY: '🎉 Your order is ready for pickup! Please collect at the counter.',
    COLLECTED: 'Order collected. Thank you!',
    CANCELLED: 'This order has been cancelled.',
  };
  return messages[status] || 'Unknown status.';
}

module.exports = { createOrder, getMyOrders, getOrderById, trackByToken, cancelOrder };
