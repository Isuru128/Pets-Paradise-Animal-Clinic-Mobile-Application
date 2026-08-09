const User = require('../models/User');
const Order = require('../models/Order');
const Pet = require('../models/Pet');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');

exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalOrders,
            totalPets,
            totalProducts,
            totalAppointments
        ] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            Pet.countDocuments(),
            Product.countDocuments(),
            Appointment.countDocuments()
        ]);

        res.json({
            totalUsers,
            totalOrders,
            totalPets,
            totalProducts,
            totalAppointments
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
