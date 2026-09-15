const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
