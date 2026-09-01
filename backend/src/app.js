const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB().catch(err => console.error('Initial DB connection error:', err.message));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ msg: 'Backend is running' });
});

// Middleware to ensure DB connection is ready for API calls
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        return res.status(500).json({ msg: 'Database connection failed. Please ensure MongoDB Atlas IP Access List allows 0.0.0.0/0' });
    }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));

module.exports = app;