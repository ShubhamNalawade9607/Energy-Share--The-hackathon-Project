const express = require('express');
const router = express.Router();
const bookingRequestController = require('../controllers/bookingRequestController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// ===========================
// USER ROUTES
// ===========================

// Create booking request
router.post('/', authMiddleware, requireRole('user'), bookingRequestController.createBookingRequest);

// Get user's booking requests
router.get('/user/list', authMiddleware, requireRole('user'), bookingRequestController.getUserBookingRequests);

// Get booking request details
router.get('/:id', authMiddleware, bookingRequestController.getBookingRequestDetail);

// Cancel booking request
router.put('/:id/cancel', authMiddleware, requireRole('user'), bookingRequestController.cancelBookingRequest);

// ===========================
// OWNER ROUTES
// ===========================

// Get all pending booking requests for owner
router.get('/owner/pending', authMiddleware, requireRole('owner'), bookingRequestController.getOwnerBookingRequests);

// Approve booking request
router.put('/:id/approve', authMiddleware, requireRole('owner'), bookingRequestController.approveBookingRequest);

// Reject booking request
router.put('/:id/reject', authMiddleware, requireRole('owner'), bookingRequestController.rejectBookingRequest);

// Start charging session
router.put('/:id/session/start', authMiddleware, requireRole('owner'), bookingRequestController.startChargingSession);

// End charging session
router.put('/:id/session/end', authMiddleware, requireRole('owner'), bookingRequestController.endChargingSession);

// Cancel approved session
router.put('/:id/session/cancel', authMiddleware, requireRole('owner'), bookingRequestController.cancelApprovedSession);

module.exports = router;
