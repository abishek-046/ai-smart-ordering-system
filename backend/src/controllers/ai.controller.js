const prisma = require('../utils/prisma');
const { getPickupSlots, getFoodRecommendations, getKitchenLoadPrediction } = require('../services/ai.service');

const pickupSlots = async (req, res, next) => {
  try {
    // Get cart items for the current user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      select: { foodItemId: true, quantity: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty. Add items before getting pickup slots.' });
    }

    const result = await getPickupSlots(req.user.id, cartItems);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const recommendations = async (req, res, next) => {
  try {
    const result = await getFoodRecommendations(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const kitchenPredictions = async (req, res, next) => {
  try {
    const result = await getKitchenLoadPrediction();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { pickupSlots, recommendations, kitchenPredictions };
