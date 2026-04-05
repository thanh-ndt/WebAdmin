const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/', appointmentController.getAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
