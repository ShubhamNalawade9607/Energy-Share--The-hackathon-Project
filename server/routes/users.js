const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// Protected routes - any authenticated user
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/impact', authMiddleware, userController.getImpact);
router.delete('/account', authMiddleware, userController.deleteAccount);

// Public leaderboard
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;
