const express = require('express');
const router = express.Router();
const vehicleModelController = require('../controllers/VehicleModelController');

// GET /api/vehicle-models - Lấy danh sách dòng xe
router.get('/', vehicleModelController.getAllModels);

// GET /api/vehicle-models/stats - Thống kê dòng xe
router.get('/stats', vehicleModelController.getModelStats);

// POST /api/vehicle-models - Thêm dòng xe mới
router.post('/', vehicleModelController.createModel);

// PUT /api/vehicle-models/:id - Cập nhật dòng xe
router.put('/:id', vehicleModelController.updateModel);

// DELETE /api/vehicle-models/:id - Xóa dòng xe
router.delete('/:id', vehicleModelController.deleteModel);

module.exports = router;
