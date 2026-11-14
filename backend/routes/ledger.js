const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ledgerController = require('../controllers/ledgerController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get worker ledger
router.get('/worker/:workerId',
    authMiddleware,
    ledgerController.getWorkerLedger
);

// Get worker balance
router.get('/worker/:workerId/balance',
    authMiddleware,
    ledgerController.getWorkerBalance
);

// Create adjustment entry (contractor only)
router.post('/adjustments',
    authMiddleware,
    requireRole('CONTRACTOR'),
    [
        body('workerId').isUUID().withMessage('Invalid worker ID'),
        body('entryType').isIn(['ADJUSTMENT_CREDIT', 'ADJUSTMENT_DEBIT']).withMessage('Invalid entry type'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('description').notEmpty().withMessage('Description is required')
    ],
    validate,
    ledgerController.createAdjustment
);

module.exports = router;
