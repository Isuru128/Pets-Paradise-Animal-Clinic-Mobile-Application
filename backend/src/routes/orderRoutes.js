const express = require('express');
const multer = require('multer');
const router = express.Router();

const { createCloudinaryStorage } = require('../config/cloudinary');

const {
    checkout,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

const { auth, adminOnly } = require('../middleware/authMiddleware');

const proofStorage = createCloudinaryStorage('payment-proofs', ['jpg', 'jpeg', 'png', 'webp', 'pdf']);

const uploadPaymentProof = multer({
    storage: proofStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only JPG, PNG, WEBP, or PDF payment proofs are allowed'));
    }
});

router.post('/checkout', auth, handlePaymentProofUpload, checkout);
router.get('/my-orders', auth, getMyOrders);
router.get('/', auth, adminOnly, getAllOrders);
router.put('/:id/status', auth, adminOnly, updateOrderStatus);
router.delete('/:id', auth, adminOnly, deleteOrder);

module.exports = router;

function handlePaymentProofUpload(req, res, next) {
    uploadPaymentProof.single('paymentProof')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ msg: error.message });
        }

        next();
    });
}