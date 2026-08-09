const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const {
    checkout,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

const { auth, adminOnly } = require('../middleware/authMiddleware');

const proofUploadDir = path.join(__dirname, '../../uploads/payment-proofs');

fs.mkdirSync(proofUploadDir, { recursive: true });

const proofStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, proofUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '');
        const safeExt = ext || getExtensionFromMime(file.mimetype);

        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${safeExt}`);
    }
});

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

function getExtensionFromMime(mimeType) {
    if (mimeType === 'image/jpeg') return '.jpg';
    if (mimeType === 'image/png') return '.png';
    if (mimeType === 'image/webp') return '.webp';
    if (mimeType === 'application/pdf') return '.pdf';

    return '';
}
