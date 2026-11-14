const db = require('../db');

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, phone_number, role, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const userData = user.rows[0];

        // Get profile
        let profile = null;
        if (userData.role === 'CONTRACTOR') {
            const result = await db.query(
                'SELECT * FROM contractor_profiles WHERE user_id = $1',
                [userData.id]
            );
            profile = result.rows[0];
        } else if (userData.role === 'WORKER') {
            const result = await db.query(
                'SELECT * FROM worker_profiles WHERE user_id = $1',
                [userData.id]
            );
            profile = result.rows[0];
        }

        res.json({
            ...userData,
            profile
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get user'
            }
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { email, address, businessName, ownerName, fullName } = req.body;
        const userId = req.user.id;

        if (req.user.role === 'CONTRACTOR') {
            const result = await db.query(
                `UPDATE contractor_profiles 
         SET email = COALESCE($1, email),
             address = COALESCE($2, address),
             business_name = COALESCE($3, business_name),
             owner_name = COALESCE($4, owner_name),
             updated_at = NOW()
         WHERE user_id = $5
         RETURNING *`,
                [email, address, businessName, ownerName, userId]
            );

            res.json({
                success: true,
                profile: result.rows[0]
            });
        } else if (req.user.role === 'WORKER') {
            const result = await db.query(
                `UPDATE worker_profiles 
         SET email = COALESCE($1, email),
             address = COALESCE($2, address),
             full_name = COALESCE($3, full_name),
             updated_at = NOW()
         WHERE user_id = $4
         RETURNING *`,
                [email, address, fullName, userId]
            );

            res.json({
                success: true,
                profile: result.rows[0]
            });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update profile'
            }
        });
    }
};

// Create worker (contractor only)
exports.createWorker = async (req, res) => {
    try {
        const {
            phoneNumber,
            fullName,
            email,
            monthlySalary,
            bankAccountNumber,
            bankIfsc,
            bankName,
            upiId,
            preferredPaymentMode
        } = req.body;

        // Get contractor profile
        const contractor = await db.query(
            'SELECT id FROM contractor_profiles WHERE user_id = $1',
            [req.user.id]
        );

        if (contractor.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CONTRACTOR_NOT_FOUND',
                    message: 'Contractor profile not found'
                }
            });
        }

        const contractorId = contractor.rows[0].id;

        // Create user for worker
        const user = await db.query(
            `INSERT INTO users (phone_number, role) 
       VALUES ($1, 'WORKER') 
       RETURNING id`,
            [phoneNumber]
        );

        const userId = user.rows[0].id;

        // Create worker profile
        const worker = await db.query(
            `INSERT INTO worker_profiles (
        user_id, contractor_id, full_name, email,
        bank_account_number, bank_ifsc, bank_name,
        upi_id, preferred_payment_mode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [userId, contractorId, fullName, email, bankAccountNumber, bankIfsc, bankName, upiId, preferredPaymentMode]
        );

        // Create salary profile
        if (monthlySalary) {
            await db.query(
                `INSERT INTO salary_profiles (worker_id, monthly_salary, effective_from)
         VALUES ($1, $2, CURRENT_DATE)`,
                [worker.rows[0].id, monthlySalary]
            );
        }

        res.status(201).json({
            success: true,
            worker: {
                id: worker.rows[0].id,
                userId,
                fullName,
                phoneNumber,
                monthlySalary,
                createdAt: worker.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Create worker error:', error);

        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DUPLICATE_PHONE',
                    message: 'Phone number already exists'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create worker'
            }
        });
    }
};

// List workers (contractor only)
exports.listWorkers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, isActive } = req.query;
        const offset = (page - 1) * limit;

        // Get contractor profile
        const contractor = await db.query(
            'SELECT id FROM contractor_profiles WHERE user_id = $1',
            [req.user.id]
        );

        if (contractor.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CONTRACTOR_NOT_FOUND',
                    message: 'Contractor profile not found'
                }
            });
        }

        const contractorId = contractor.rows[0].id;

        // Build query
        let query = `
      SELECT 
        w.id,
        w.full_name,
        u.phone_number,
        s.monthly_salary,
        wb.outstanding_balance as current_balance,
        u.is_active
      FROM worker_profiles w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN salary_profiles s ON w.id = s.worker_id AND s.is_active = true
      LEFT JOIN worker_balances wb ON w.id = wb.worker_id
      WHERE w.contractor_id = $1
    `;

        const params = [contractorId];
        let paramIndex = 2;

        if (search) {
            query += ` AND (w.full_name ILIKE $${paramIndex} OR u.phone_number ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (isActive !== undefined) {
            query += ` AND u.is_active = $${paramIndex}`;
            params.push(isActive === 'true');
            paramIndex++;
        }

        query += ` ORDER BY w.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const workers = await db.query(query, params);

        // Get total count
        const countResult = await db.query(
            'SELECT COUNT(*) FROM worker_profiles WHERE contractor_id = $1',
            [contractorId]
        );
        const total = parseInt(countResult.rows[0].count);

        res.json({
            workers: workers.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List workers error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to list workers'
            }
        });
    }
};

// Get worker details
exports.getWorkerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const worker = await db.query(
            `SELECT 
        w.*,
        u.phone_number,
        s.monthly_salary,
        wb.salary_earned,
        wb.salary_paid,
        wb.advances_given,
        wb.outstanding_balance
      FROM worker_profiles w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN salary_profiles s ON w.id = s.worker_id AND s.is_active = true
      LEFT JOIN worker_balances wb ON w.id = wb.worker_id
      WHERE w.id = $1`,
            [id]
        );

        if (worker.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'WORKER_NOT_FOUND',
                    message: 'Worker not found'
                }
            });
        }

        // Get recent transactions
        const transactions = await db.query(
            `SELECT * FROM transactions 
       WHERE worker_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
            [id]
        );

        const workerData = worker.rows[0];

        res.json({
            id: workerData.id,
            fullName: workerData.full_name,
            phoneNumber: workerData.phone_number,
            email: workerData.email,
            monthlySalary: workerData.monthly_salary,
            bankDetails: {
                accountNumber: workerData.bank_account_number,
                ifsc: workerData.bank_ifsc,
                bankName: workerData.bank_name
            },
            upiId: workerData.upi_id,
            preferredPaymentMode: workerData.preferred_payment_mode,
            balance: {
                salaryEarned: workerData.salary_earned || 0,
                salaryPaid: workerData.salary_paid || 0,
                advancesGiven: workerData.advances_given || 0,
                outstandingBalance: workerData.outstanding_balance || 0
            },
            recentTransactions: transactions.rows
        });
    } catch (error) {
        console.error('Get worker details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get worker details'
            }
        });
    }
};
