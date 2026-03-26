const express = require('express');
const router = express.Router();
const { uploadVehicleImages } = require('../congfig/cloudinaryVehicle');
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', uploadVehicleImages, vehicleController.createVehicle);
router.put('/:id', uploadVehicleImages, vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
