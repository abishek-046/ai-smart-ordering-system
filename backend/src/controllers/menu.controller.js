const prisma = require('../utils/prisma');

const VALID_CATEGORIES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];

// ── Shared validation helper ──────────────────────────────────────────────────
function validateMenuInput({ name, price, prepTimeMinutes, category }, isCreate = true) {
  const errors = [];

  if (isCreate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (name && name.trim().length > 100) {
      errors.push('Name must be 100 characters or fewer.');
    }
  }

  if (isCreate || price !== undefined) {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      errors.push('Price must be a positive number.');
    }
    if (p > 10000) {
      errors.push('Price cannot exceed ₹10,000.');
    }
  }

  if (isCreate || prepTimeMinutes !== undefined) {
    const t = parseInt(prepTimeMinutes);
    if (prepTimeMinutes !== undefined && (isNaN(t) || t < 1)) {
      errors.push('Preparation time must be at least 1 minute.');
    }
    if (!isNaN(t) && t > 180) {
      errors.push('Preparation time cannot exceed 180 minutes.');
    }
  }

  if (isCreate || category !== undefined) {
    if (category && !VALID_CATEGORIES.includes(category.toUpperCase())) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
    }
  }

  return errors;
}

// ── Public routes ─────────────────────────────────────────────────────────────
const getMenu = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;
    const where = {};

    if (category) {
      const cat = category.toUpperCase();
      if (!VALID_CATEGORIES.includes(cat)) {
        return res.status(400).json({ success: false, message: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}` });
      }
      where.category = cat;
    }

    if (available !== undefined) where.isAvailable = available === 'true';

    if (search) {
      const safe = search.trim().slice(0, 100);
      where.OR = [
        { name: { contains: safe, mode: 'insensitive' } },
        { description: { contains: safe, mode: 'insensitive' } },
        { tags: { has: safe.toLowerCase() } },
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

// ── Admin routes ──────────────────────────────────────────────────────────────
const createFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, prepTimeMinutes, tags } = req.body;

    const validationErrors = validateMenuInput({ name, price, prepTimeMinutes, category }, true);
    if (!category || !VALID_CATEGORIES.includes(category.toUpperCase())) {
      validationErrors.push(`Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}.`);
    }
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: validationErrors.join(' ') });
    }

    const item = await prisma.foodItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(parseFloat(price).toFixed(2)),
        category: category.toUpperCase(),
        image: image?.trim() || null,
        prepTimeMinutes: parseInt(prepTimeMinutes) || 10,
        tags: Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      },
    });

    res.status(201).json({ success: true, message: 'Food item created.', item });
  } catch (error) {
    next(error);
  }
};

const updateFoodItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, prepTimeMinutes, isAvailable, tags } = req.body;

    const existing = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const validationErrors = validateMenuInput({ name, price, prepTimeMinutes, category }, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: validationErrors.join(' ') });
    }

    const updateData = {};
    if (name !== undefined)            updateData.name = name.trim();
    if (description !== undefined)     updateData.description = description.trim();
    if (price !== undefined)           updateData.price = parseFloat(parseFloat(price).toFixed(2));
    if (category !== undefined)        updateData.category = category.toUpperCase();
    if (image !== undefined)           updateData.image = image?.trim() || null;
    if (prepTimeMinutes !== undefined) updateData.prepTimeMinutes = parseInt(prepTimeMinutes);
    if (isAvailable !== undefined)     updateData.isAvailable = Boolean(isAvailable);
    if (tags !== undefined)            updateData.tags = Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [];

    const item = await prisma.foodItem.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, message: 'Food item updated.', item });
  } catch (error) {
    next(error);
  }
};

const deleteFoodItem = async (req, res, next) => {
  try {
    const existing = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    // Check if this item is referenced in any order items
    // If so, just mark unavailable instead of hard-deleting (preserves order history integrity)
    const usedInOrders = await prisma.orderItem.findFirst({
      where: { foodItemId: req.params.id },
    });

    if (usedInOrders) {
      // Soft-delete: mark unavailable so existing orders are preserved
      const updated = await prisma.foodItem.update({
        where: { id: req.params.id },
        data: { isAvailable: false },
      });
      return res.json({
        success: true,
        message: 'Item has existing orders — marked as unavailable instead of deleted (preserves order history).',
        item: updated,
        softDeleted: true,
      });
    }

    // No order history — safe to hard delete
    // First remove any cart references
    await prisma.cartItem.deleteMany({ where: { foodItemId: req.params.id } });
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
    res.json({
      success: true,
      message: `Item marked ${updated.isAvailable ? 'available' : 'unavailable'}.`,
      item: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ── Rating endpoint ───────────────────────────────────────────────────────────
/**
 * POST /menu/:id/rate
 * Authenticated students can submit a rating (1–5 stars).
 * Uses Bayesian average to update the stored rating.
 */
const rateFoodItem = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const r = parseInt(rating);
    if (isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const item = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Food item not found.' });
    if (!item.isAvailable) return res.status(400).json({ success: false, message: 'Cannot rate an unavailable item.' });

    // Bayesian update: new_avg = (old_avg * old_count + new_rating) / (old_count + 1)
    const newCount  = item.totalRatings + 1;
    const newRating = parseFloat(((item.rating * item.totalRatings + r) / newCount).toFixed(2));

    const updated = await prisma.foodItem.update({
      where: { id: req.params.id },
      data: { rating: newRating, totalRatings: newCount },
    });

    res.json({ success: true, message: 'Rating submitted.', rating: updated.rating, totalRatings: updated.totalRatings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenu, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem, toggleAvailability, rateFoodItem };
