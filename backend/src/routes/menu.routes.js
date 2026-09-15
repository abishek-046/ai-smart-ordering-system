const express = require('express');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { getMenu, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem, toggleAvailability } = require('../controllers/menu.controller');

const router = express.Router();

router.get('/', getMenu);
router.get('/:id', getFoodItem);
router.post('/', protect, adminOnly, createFoodItem);
router.put('/:id', protect, adminOnly, updateFoodItem);
router.delete('/:id', protect, adminOnly, deleteFoodItem);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);

module.exports = router;
