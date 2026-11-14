const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// List transactions
router.get('/',
    authMiddleware,
    transactionController.listTransactions
);

// Get transaction details
router.get('/:id',
    authMiddleware,
    transactionController.getTransactionDetails
);

// Confirm cash payment (contractor only)
router.post('/:id/confirm-cash',
    authMiddleware,
    requireRole('CONTRACTOR'),
    transactionController.confirmCashPayment
);

module.exports = router;
