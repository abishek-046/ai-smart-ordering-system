const prisma = require('../utils/prisma');
const { generateOrderToken } = require('../utils/tokenGenerator');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusMessage(status) {
  const messages = {
    PENDING:   'Your order has been placed and is waiting for confirmation.',
    ACCEPTED:  'Your order has been accepted by the canteen.',
    PREPARING: 'Your food is being prepared in the kitchen.',
    READY:     'Your order is ready for pickup! Please collect at the counter.',
    COLLECTED: 'Order collected. Thank you!',
    CANCELLED: 'This order has been cancelled.',
  };
  return messages[status] || 'Unknown status.';
}

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = async (req, res, next) => {
  try {
    const { pickupTime, specialInstructions } = req.body;

    // 1. Validate pickupTime
    if (!pickupTime) {
      return res.status(400).json({ success: false, message: 'Pickup time is required.' });
    }
    const pickupDate = new Date(pickupTime);
    if (isNaN(pickupDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid pickup time format.' });
    }
    const now = new Date();
    if (pickupDate <= now) {
      return res.status(400).json({ success: false, message: 'Pickup time must be in the future.' });
    }
    // Pickup must be within 24 hours from now
    const maxPickup = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (pickupDate > maxPickup) {
      return res.status(400).json({ success: false, message: 'Pickup time cannot be more than 24 hours from now.' });
    }

    // 2. Check if user already has an active (non-terminal) pending order
    //    This prevents duplicate submissions from double-clicks or race conditions
    const activeOrder = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ['PENDING'] },
        createdAt: { gte: new Date(now.getTime() - 60 * 1000) }, // within last 60 seconds
      },
    });
    if (activeOrder) {
      return res.status(409).json({
        success: false,
        message: 'You just placed an order. Please wait before placing another.',
        orderId: activeOrder.id,
        token: activeOrder.token,
      });
    }

    // 3. Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { foodItem: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // 4. Validate all items are still available
    const unavailable = cartItems.filter(ci => !ci.foodItem.isAvailable);
    if (unavailable.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are no longer available: ${unavailable.map(ci => ci.foodItem.name).join(', ')}`,
      });
    }

    // 5. Validate quantities
    const invalidQty = cartItems.filter(ci => ci.quantity < 1 || ci.quantity > 20);
    if (invalidQty.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more cart items have an invalid quantity.',
      });
    }

    // 6. Calculate total server-side (never trust client price)
    const totalAmount = cartItems.reduce(
      (sum, ci) => sum + ci.foodItem.price * ci.quantity, 0
    );
    const maxPrepTime = Math.max(...cartItems.map(ci => ci.foodItem.prepTimeMinutes));
    const estimatedPrepTime = maxPrepTime + Math.ceil(
      cartItems.reduce((s, ci) => s + ci.quantity, 0) * 1.5
    );

    // 7. Generate unique token (with collision retry)
    let token;
    let attempts = 0;
    do {
      token = generateOrderToken();
      const existing = await prisma.order.findUnique({ where: { token } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    // Verify final token is unique (handles the edge case where all 10 attempts collide)
    const tokenConflict = await prisma.order.findUnique({ where: { token } });
    if (tokenConflict) {
      return res.status(500).json({ success: false, message: 'Could not generate a unique order token. Please try again.' });
    }

    // 8. Create order atomically — price computed from DB, cart cleared in same transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          token,
          userId: req.user.id,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          pickupTime: pickupDate,
          estimatedPrepTime,
          specialInstructions: specialInstructions?.trim() || null,
          items: {
            create: cartItems.map(ci => ({
              foodItemId: ci.foodItemId,
              quantity: ci.quantity,
              unitPrice: ci.foodItem.price, // snapshot price at order time
            })),
          },
        },
        include: {
          items: { include: { foodItem: true } },
          user: { select: { name: true, email: true, studentId: true } },
        },
      });
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return newOrder;
    });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────

const getMyOrders = async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    // Clamp pagination values
    const take = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = Math.max(parseInt(offset) || 0, 0);

    const where = { userId: req.user.id };
    if (status) {
      const s = status.toUpperCase();
      const valid = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
      if (!valid.includes(s)) {
        return res.status(400).json({ success: false, message: `Invalid status. Use: ${valid.join(', ')}` });
      }
      where.status = s;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: { include: { foodItem: { select: { name: true, image: true, category: true } } } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total, limit: take, offset: skip });
  } catch (error) {
    next(error);
  }
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────

const getOrderById = async (req, res, next) => {
  try {
    // userId scoped — student can only see their own orders
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

// ─── Track By Token ───────────────────────────────────────────────────────────

const trackByToken = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { token: req.params.token },
      include: {
        items: { include: { foodItem: { select: { name: true, image: true, prepTimeMinutes: true, category: true } } } },
        user: { select: { name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with this token.' });
    }

    // Ownership check — student can only track their own order; admin can track any
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const statusProgress = { PENDING: 10, ACCEPTED: 30, PREPARING: 60, READY: 90, COLLECTED: 100, CANCELLED: 0 };
    const now = new Date();
    const minutesUntilPickup = Math.max(0, Math.round((new Date(order.pickupTime) - now) / 60000));

    res.json({
      success: true,
      order,
      tracking: {
        progress: statusProgress[order.status] || 0,
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

// ─── Cancel Order ─────────────────────────────────────────────────────────────

const cancelOrder = async (req, res, next) => {
  try {
    // Scoped to owner
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at status "${order.status}". Only PENDING orders can be cancelled.`,
      });
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

module.exports = { createOrder, getMyOrders, getOrderById, trackByToken, cancelOrder };
