const express    = require('express');
const rateLimit  = require('express-rate-limit');
const { protect } = require('../middleware/auth.middleware');
const { createOrder, getMyOrders, getOrderById, trackByToken, cancelOrder } = require('../controllers/order.controller');

const router = express.Router();

// Per-user order creation rate limiter: max 10 orders per hour
// Applied after protect so req.user is available for keyGenerator
const orderCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, message: 'You have placed too many orders this hour. Please wait before ordering again.' },
});

router.use(protect);

router.post('/', orderCreationLimiter, createOrder);
router.get('/', getMyOrders);
router.get('/track/:token', trackByToken);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
