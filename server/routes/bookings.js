const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// User routes
router.post('/', authMiddleware, requireRole('user'), bookingController.createBooking);
router.get('/user/list', authMiddleware, requireRole('user'), bookingController.getUserBookings);
router.put('/:id/complete', authMiddleware, requireRole('user'), bookingController.completeBooking);
router.put('/:id/cancel', authMiddleware, requireRole('user'), bookingController.cancelBooking);

// Owner routes
router.get('/charger/:chargerId', authMiddleware, requireRole('owner'), bookingController.getChargerBookings);

module.exports = router;
