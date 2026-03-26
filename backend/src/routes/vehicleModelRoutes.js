const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');

// GET /api/vehicle-models - Lấy danh sách dòng xe
router.get('/', async (req, res) => {
  try {
    const models = await VehicleModel.find().sort({ name: 1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
