const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/congfig/db');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
connectDB();

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'Admin Backend API đang hoạt động!' });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/vehicles', require('./src/routes/vehicleRoutes'));
app.use('/api/brands', require('./src/routes/brandRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/chats', require('./src/routes/chatRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/vehicle-models', require('./src/routes/vehicleModelRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/promotions', require('./src/routes/promotionRoutes'));
app.use('/api/returns', require('./src/routes/returnRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Admin Server đang chạy trên port ${PORT}`);
});

module.exports = app;
