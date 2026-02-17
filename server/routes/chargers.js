const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// Public routes
router.get('/', chargerController.getAllChargers);
router.get('/:id', chargerController.getChargerById);

// Owner only routes
router.post('/', authMiddleware, requireRole('owner'), chargerController.createCharger);
router.get('/owner/list', authMiddleware, requireRole('owner'), chargerController.getOwnerChargers);
router.put('/:id', authMiddleware, requireRole('owner'), chargerController.updateCharger);
router.delete('/:id', authMiddleware, requireRole('owner'), chargerController.deleteCharger);

module.exports = router;
