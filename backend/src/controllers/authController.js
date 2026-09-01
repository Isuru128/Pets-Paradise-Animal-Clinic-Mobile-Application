const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// REGISTER USER
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address, role } = req.body;
        const mobileNumber = String(phone || '').replace(/\D/g, '');

        if (!name || !email || !password || !mobileNumber) {
            return res.status(400).json({
                msg: 'Name, email, mobile number and password are required'
            });
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                msg: 'Mobile number must be exactly 10 digits'
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                msg: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: mobileNumber,
            address: address || '',
            role: role === 'admin' ? 'admin' : 'user'
        });

        res.status(201).json({
            msg: 'Profile created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};

// LOGIN USER
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                msg: 'Email and password required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            msg: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            msg: error.message
        });

    }
};

// GET CURRENT USER PROFILE
exports.me = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select('-password');

        res.json(user);

    } catch (error) {

        res.status(500).json({
            msg: error.message
        });

    }

};

exports.updateMe = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ msg: 'Name is required' });
            }

            updates.name = name.trim();
        }

        if (phone !== undefined) {
            const mobileNumber = String(phone || '').replace(/\D/g, '');

            if (!/^\d{10}$/.test(mobileNumber)) {
                return res.status(400).json({ msg: 'Mobile number must be exactly 10 digits' });
            }

            updates.phone = mobileNumber;
        }

        if (address !== undefined) {
            updates.address = address.trim();
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                msg: 'Current password, new password and confirmation are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                msg: 'New password must be at least 6 characters'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                msg: 'New passwords do not match'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                msg: 'New password must be different from current password'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};
