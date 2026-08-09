const express = require('express');
const router = express.Router();

const { register, login, me, updateMe, changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.put('/me', auth, updateMe);
router.put('/change-password', auth, changePassword);

module.exports = router;
