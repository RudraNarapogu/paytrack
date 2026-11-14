const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
    // For development/testing, always return 000000
    if (process.env.NODE_ENV === 'development') {
        return '000000';
    }
    const length = parseInt(process.env.OTP_LENGTH) || 6;
    return crypto.randomInt(100000, 999999).toString().substring(0, length);
};

// Send OTP (simplified - integrate with Twilio/Firebase in production)
exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Validate phone number format
        if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PHONE',
                    message: 'Invalid phone number format'
                }
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
        const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);

        // Store OTP
        otpStore.set(phoneNumber, { otp, expiresAt });

        // TODO: Send OTP via SMS (Twilio/Firebase)
        console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

        // Clean up expired OTPs
        setTimeout(() => otpStore.delete(phoneNumber), expiryMinutes * 60 * 1000);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            expiresIn: expiryMinutes * 60,
            // REMOVE IN PRODUCTION - only for development
            ...(process.env.NODE_ENV === 'development' && { otp })
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to send OTP'
            }
        });
    }
};

// Verify OTP and login
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        // Validate input
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'Phone number and OTP are required'
                }
            });
        }

        // Check OTP
        const storedOTP = otpStore.get(phoneNumber);

        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'OTP_NOT_FOUND',
                    message: 'OTP not found or expired'
                }
            });
        }

        if (storedOTP.expiresAt < Date.now()) {
            otpStore.delete(phoneNumber);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'OTP_EXPIRED',
                    message: 'OTP has expired'
                }
            });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: 'Invalid OTP'
                }
            });
        }

        // OTP is valid, delete it
        otpStore.delete(phoneNumber);

        // Get or create user
        let user = await db.query(
            'SELECT * FROM users WHERE phone_number = $1',
            [phoneNumber]
        );

        if (user.rows.length === 0) {
            // Create new user (default role: WORKER)
            user = await db.query(
                `INSERT INTO users (phone_number, role) 
         VALUES ($1, $2) 
         RETURNING *`,
                [phoneNumber, 'WORKER']
            );
        }

        const userData = user.rows[0];

        // Get profile based on role
        let profile = null;
        if (userData.role === 'CONTRACTOR') {
            const contractorProfile = await db.query(
                'SELECT * FROM contractor_profiles WHERE user_id = $1',
                [userData.id]
            );
            profile = contractorProfile.rows[0] || null;
        } else if (userData.role === 'WORKER') {
            const workerProfile = await db.query(
                'SELECT * FROM worker_profiles WHERE user_id = $1',
                [userData.id]
            );
            profile = workerProfile.rows[0] || null;
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
            {
                userId: userData.id,
                role: userData.role,
                phoneNumber: userData.phone_number
            },
            process.env.JWT_SECRET,
            { expiresIn: `${process.env.JWT_EXPIRATION}s` }
        );

        const refreshToken = jwt.sign(
            {
                userId: userData.id,
                role: userData.role
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: `${process.env.JWT_REFRESH_EXPIRATION}s` }
        );

        // Update last login
        await db.query(
            'UPDATE users SET last_login_at = NOW() WHERE id = $1',
            [userData.id]
        );

        res.json({
            success: true,
            token: accessToken, // Frontend expects 'token'
            accessToken,
            refreshToken,
            expiresIn: parseInt(process.env.JWT_EXPIRATION),
            user: {
                id: userData.id,
                phoneNumber: userData.phone_number,
                role: userData.role,
                profile
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to verify OTP'
            }
        });
    }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Refresh token is required'
                }
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Generate new access token
        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role
            },
            process.env.JWT_SECRET,
            { expiresIn: `${process.env.JWT_EXPIRATION}s` }
        );

        res.json({
            success: true,
            accessToken,
            expiresIn: parseInt(process.env.JWT_EXPIRATION)
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Invalid or expired refresh token'
                }
            });
        }

        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to refresh token'
            }
        });
    }
};
