const express = require('express');
const router = express.Router();

const { auth, adminOnly } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/adminController');

router.get('/stats', auth, adminOnly, getStats);

router.get('/orders', auth, adminOnly, require('../controllers/orderController').getAllOrders);
router.get('/appointments', auth, adminOnly, require('../controllers/appointmentController').getAllAppointments);

module.exports = router;
