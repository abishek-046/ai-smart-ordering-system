const express = require('express');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  getMenu, getFoodItem, createFoodItem, updateFoodItem,
  deleteFoodItem, toggleAvailability, rateFoodItem,
} = require('../controllers/menu.controller');

const router = express.Router();

// Public
router.get('/', getMenu);
router.get('/:id', getFoodItem);

// Student — submit a rating (1–5 stars)
router.post('/:id/rate', protect, rateFoodItem);

// Admin only
router.post('/', protect, adminOnly, createFoodItem);
router.put('/:id', protect, adminOnly, updateFoodItem);
router.delete('/:id', protect, adminOnly, deleteFoodItem);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);

module.exports = router;
