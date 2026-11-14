const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Contractor dashboard
router.get('/contractor',
    authMiddleware,
    requireRole('CONTRACTOR'),
    dashboardController.getContractorDashboard
);

// Worker dashboard
router.get('/worker',
    authMiddleware,
    requireRole('WORKER'),
    dashboardController.getWorkerDashboard
);

module.exports = router;
