const express = require('express');
const router = express.Router();

const {
    getFeaturedProducts,
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { auth, adminOnly } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedProducts);
router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);

router.post('/', auth, adminOnly, createProduct);
router.put('/:id', auth, adminOnly, updateProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);

module.exports = router;