const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

// Send OTP
router.post('/send-otp',
    [
        body('phoneNumber')
            .matches(/^\+?[1-9]\d{1,14}$/)
            .withMessage('Invalid phone number format')
    ],
    validate,
    authController.sendOTP
);

// Verify OTP
router.post('/verify-otp',
    [
        body('phoneNumber')
            .matches(/^\+?[1-9]\d{1,14}$/)
            .withMessage('Invalid phone number format'),
        body('otp')
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be 6 digits')
    ],
    validate,
    authController.verifyOTP
);

// Refresh token
router.post('/refresh',
    [
        body('refreshToken')
            .notEmpty()
            .withMessage('Refresh token is required')
    ],
    validate,
    authController.refreshToken
);

module.exports = router;
