const prisma = require('../utils/prisma');

const getMenu = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;
    const where = {};

    if (category) where.category = category.toUpperCase();
    if (available !== undefined) where.isAvailable = available === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const items = await prisma.foodItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { rating: 'desc' }],
    });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

const getFoodItem = async (req, res, next) => {
  try {
    const item = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

const createFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, prepTimeMinutes, tags } = req.body;
    const item = await prisma.foodItem.create({
      data: { name, description, price: parseFloat(price), category, image, prepTimeMinutes: parseInt(prepTimeMinutes) || 10, tags: tags || [] },
    });
    res.status(201).json({ success: true, message: 'Food item created.', item });
  } catch (error) {
    next(error);
  }
};

const updateFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, prepTimeMinutes, isAvailable, tags } = req.body;
    const item = await prisma.foodItem.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category !== undefined && { category }),
        ...(image !== undefined && { image }),
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes: parseInt(prepTimeMinutes) }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(tags !== undefined && { tags }),
      },
    });
    res.json({ success: true, message: 'Food item updated.', item });
  } catch (error) {
    next(error);
  }
};

const deleteFoodItem = async (req, res, next) => {
  try {
    await prisma.foodItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Food item deleted.' });
  } catch (error) {
    next(error);
  }
};

const toggleAvailability = async (req, res, next) => {
  try {
    const item = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const updated = await prisma.foodItem.update({
      where: { id: req.params.id },
      data: { isAvailable: !item.isAvailable },
    });
    res.json({ success: true, message: `Item marked ${updated.isAvailable ? 'available' : 'unavailable'}.`, item: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenu, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem, toggleAvailability };
