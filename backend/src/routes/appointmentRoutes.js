const express = require('express');
const router = express.Router();

const {
    createAppointment,
    getAvailableSlots,
    getMyAppointments,
    cancelMyAppointment,
    getAllAppointments,
    updateAppointmentStatus
} = require('../controllers/appointmentController');

const { auth, adminOnly } = require('../middleware/authMiddleware');

router.post('/', auth, createAppointment);
router.get('/available-slots', auth, getAvailableSlots);
router.get('/my-appointments', auth, getMyAppointments);
router.put('/:id/cancel', auth, cancelMyAppointment);

router.get('/', auth, adminOnly, getAllAppointments);
router.put('/:id/status', auth, adminOnly, updateAppointmentStatus);

module.exports = router;
