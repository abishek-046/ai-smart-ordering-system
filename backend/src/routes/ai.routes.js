const express = require('express');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { pickupSlots, recommendations, kitchenPredictions } = require('../controllers/ai.controller');

const router = express.Router();

router.get('/pickup-slots', protect, pickupSlots);
router.get('/recommendations', protect, recommendations);
router.get('/kitchen-predictions', protect, adminOnly, kitchenPredictions);

module.exports = router;
