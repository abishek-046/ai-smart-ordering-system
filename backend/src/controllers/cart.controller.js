const prisma = require('../utils/prisma');

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
    if (!foodItemId) return res.status(400).json({ success: false, message: 'foodItemId is required.' });

    const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    if (!foodItem) return res.status(404).json({ success: false, message: 'Food item not found.' });
    if (!foodItem.isAvailable) return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });

    const cartItem = await prisma.cartItem.upsert({
      where: { userId_foodItemId: { userId: req.user.id, foodItemId } },
      update: { quantity: { increment: parseInt(quantity) } },
      create: { userId: req.user.id, foodItemId, quantity: parseInt(quantity) },
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

    if (parseInt(quantity) <= 0) {
      await prisma.cartItem.deleteMany({ where: { userId: req.user.id, foodItemId } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { userId_foodItemId: { userId: req.user.id, foodItemId } },
      data: { quantity: parseInt(quantity) },
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
