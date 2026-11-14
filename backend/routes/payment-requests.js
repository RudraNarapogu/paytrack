const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentRequestController = require('../controllers/paymentRequestController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Create payment request (worker only)
router.post('/',
    authMiddleware,
    requireRole('WORKER'),
    [
        body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
        body('category').isIn(['ADVANCE', 'SALARY', 'EXPENSE']).withMessage('Invalid category'),
        body('paymentMode').isIn(['CASH', 'UPI', 'BANK_TRANSFER']).withMessage('Invalid payment mode')
    ],
    validate,
    paymentRequestController.createRequest
);

// List payment requests
router.get('/',
    authMiddleware,
    paymentRequestController.listRequests
);

// Get payment request details
router.get('/:id',
    authMiddleware,
    paymentRequestController.getRequestDetails
);

// Approve payment request (contractor only)
router.patch('/:id/approve',
    authMiddleware,
    requireRole('CONTRACTOR'),
    [
        body('modifiedAmount').optional().isFloat({ min: 1 }),
        body('modifiedCategory').optional().isIn(['ADVANCE', 'SALARY', 'EXPENSE'])
    ],
    validate,
    paymentRequestController.approveRequest
);

// Reject payment request (contractor only)
router.patch('/:id/reject',
    authMiddleware,
    requireRole('CONTRACTOR'),
    [
        body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
    ],
    validate,
    paymentRequestController.rejectRequest
);

module.exports = router;
