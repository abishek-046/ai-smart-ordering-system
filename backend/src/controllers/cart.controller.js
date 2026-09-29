const prisma = require('../utils/prisma');

const MAX_QUANTITY = 20; // reasonable upper limit per item

const getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { foodItem: true },
      orderBy: { createdAt: 'asc' },
    });

    const total = items.reduce((sum, ci) => sum + ci.foodItem.price * ci.quantity, 0);
    const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);

    res.json({ success: true, items, total: parseFloat(total.toFixed(2)), totalItems });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { foodItemId, quantity = 1 } = req.body;

    if (!foodItemId) {
      return res.status(400).json({ success: false, message: 'foodItemId is required.' });
    }

    const qty = parseInt(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }
    if (qty > MAX_QUANTITY) {
      return res.status(400).json({ success: false, message: `Quantity cannot exceed ${MAX_QUANTITY} per item.` });
    }

    const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }
    if (!foodItem.isAvailable) {
      return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });
    }

    // Check existing cart quantity to prevent exceeding limit via increments
    const existing = await prisma.cartItem.findUnique({
      where: { userId_foodItemId: { userId: req.user.id, foodItemId } },
    });
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + qty > MAX_QUANTITY) {
      return res.status(400).json({
        success: false,
        message: `You already have ${currentQty} of this item. Maximum allowed is ${MAX_QUANTITY}.`,
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { userId_foodItemId: { userId: req.user.id, foodItemId } },
      update: { quantity: { increment: qty } },
      create: { userId: req.user.id, foodItemId, quantity: qty },
      include: { foodItem: true },
    });

    res.json({ success: true, message: 'Item added to cart.', cartItem });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { foodItemId, quantity } = req.body;

    if (!foodItemId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'foodItemId and quantity are required.' });
    }

    const qty = parseInt(quantity);
    if (!Number.isInteger(qty)) {
      return res.status(400).json({ success: false, message: 'Quantity must be an integer.' });
    }

    // quantity <= 0 means remove the item
    if (qty <= 0) {
      await prisma.cartItem.deleteMany({ where: { userId: req.user.id, foodItemId } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    if (qty > MAX_QUANTITY) {
      return res.status(400).json({ success: false, message: `Quantity cannot exceed ${MAX_QUANTITY} per item.` });
    }

    const cartItem = await prisma.cartItem.update({
      where: { userId_foodItemId: { userId: req.user.id, foodItemId } },
      data: { quantity: qty },
      include: { foodItem: true },
    });

    res.json({ success: true, message: 'Cart updated.', cartItem });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    // itemId is the foodItemId (backend uses deleteMany with userId + foodItemId)
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id, foodItemId: itemId } });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
