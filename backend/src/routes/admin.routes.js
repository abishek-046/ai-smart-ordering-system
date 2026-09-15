const express = require('express');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { getAllOrders, updateOrderStatus, getKitchenQueue, getAnalytics, getDashboardSummary } = require('../controllers/admin.controller');
const { getMenu, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem, toggleAvailability } = require('../controllers/menu.controller');
const { kitchenPredictions } = require('../controllers/ai.controller');

const router = express.Router();

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Kitchen
router.get('/kitchen-queue', getKitchenQueue);

// Analytics
router.get('/analytics', getAnalytics);

// AI Predictions
router.get('/ai-predictions', kitchenPredictions);

// Menu management (admin-specific endpoints)
router.get('/menu', getMenu);
router.post('/menu', createFoodItem);
router.put('/menu/:id', updateFoodItem);
router.delete('/menu/:id', deleteFoodItem);
router.patch('/menu/:id/availability', toggleAvailability);

module.exports = router;
