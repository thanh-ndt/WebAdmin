const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/congfig/db');

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'https://motorbike-management.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
connectDB();

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Admin Server đang chạy trên port ${PORT}`);
});

module.exports = app;
