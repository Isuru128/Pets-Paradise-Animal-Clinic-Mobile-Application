const express = require('express');
const router = express.Router();

const {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem
} = require('../controllers/cartController');

const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, getMyCart);
router.post('/', auth, addToCart);
router.put('/:productId', auth, updateCartItem);
router.delete('/:productId', auth, removeCartItem);

module.exports = router;