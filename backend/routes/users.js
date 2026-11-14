const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get current user
router.get('/me', authMiddleware, userController.getCurrentUser);

// Update profile
router.patch('/me', authMiddleware, userController.updateProfile);

// Create worker (contractor only)
router.post('/workers',
    authMiddleware,
    requireRole('CONTRACTOR'),
    [
        body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/),
        body('fullName').notEmpty(),
        body('monthlySalary').optional().isFloat({ min: 0 })
    ],
    validate,
    userController.createWorker
);

// List workers (contractor only)
router.get('/workers',
    authMiddleware,
    requireRole('CONTRACTOR'),
    userController.listWorkers
);

// Get worker details
router.get('/workers/:id',
    authMiddleware,
    userController.getWorkerDetails
);

module.exports = router;
