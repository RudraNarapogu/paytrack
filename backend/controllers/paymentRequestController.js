const db = require('../db');

// Create payment request (worker only)
exports.createRequest = async (req, res) => {
    try {
        const {
            amount,
            category,
            paymentMode,
            purpose,
            notes,
            projectId
        } = req.body;

        // Get worker profile
        const worker = await db.query(
            'SELECT id, contractor_id FROM worker_profiles WHERE user_id = $1',
            [req.user.id]
        );

        if (worker.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'WORKER_NOT_FOUND',
                    message: 'Worker profile not found'
                }
            });
        }

        const { id: workerId, contractor_id: contractorId } = worker.rows[0];

        // Create payment request
        const result = await db.query(
            `INSERT INTO payment_requests (
        worker_id, contractor_id, project_id,
        amount, category, payment_mode, purpose, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
            [workerId, contractorId, projectId, amount, category, paymentMode, purpose, notes]
        );

        // TODO: Send notification to contractor

        res.status(201).json({
            success: true,
            paymentRequest: {
                id: result.rows[0].id,
                amount: result.rows[0].amount,
                category: result.rows[0].category,
                paymentMode: result.rows[0].payment_mode,
                status: result.rows[0].status,
                createdAt: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Create payment request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create payment request'
            }
        });
    }
};

// List payment requests
exports.listRequests = async (req, res) => {
    try {
        const { status, workerId, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        pr.*,
        w.full_name as worker_name,
        u.phone_number as worker_phone
      FROM payment_requests pr
      JOIN worker_profiles w ON pr.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      WHERE 1=1
    `;

        const params = [];
        let paramIndex = 1;

        // Filter by role
        if (req.user.role === 'CONTRACTOR') {
            const contractor = await db.query(
                'SELECT id FROM contractor_profiles WHERE user_id = $1',
                [req.user.id]
            );
            query += ` AND pr.contractor_id = $${paramIndex}`;
            params.push(contractor.rows[0].id);
            paramIndex++;
        } else if (req.user.role === 'WORKER') {
            const worker = await db.query(
                'SELECT id FROM worker_profiles WHERE user_id = $1',
                [req.user.id]
            );
            query += ` AND pr.worker_id = $${paramIndex}`;
            params.push(worker.rows[0].id);
            paramIndex++;
        }

        // Filter by status
        if (status) {
            query += ` AND pr.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Filter by worker (contractor only)
        if (workerId && req.user.role === 'CONTRACTOR') {
            query += ` AND pr.worker_id = $${paramIndex}`;
            params.push(workerId);
            paramIndex++;
        }

        query += ` ORDER BY pr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const requests = await db.query(query, params);

        res.json({
            requests: requests.rows.map(r => ({
                id: r.id,
                worker: {
                    id: r.worker_id,
                    fullName: r.worker_name,
                    phoneNumber: r.worker_phone
                },
                amount: r.amount,
                category: r.category,
                paymentMode: r.payment_mode,
                status: r.status,
                purpose: r.purpose,
                notes: r.notes,
                createdAt: r.created_at
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('List payment requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to list payment requests'
            }
        });
    }
};

// Get payment request details
exports.getRequestDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
        pr.*,
        w.full_name as worker_name,
        w.id as worker_id,
        u.phone_number as worker_phone,
        cp.business_name as contractor_name
      FROM payment_requests pr
      JOIN worker_profiles w ON pr.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      JOIN contractor_profiles cp ON pr.contractor_id = cp.id
      WHERE pr.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Payment request not found'
                }
            });
        }

        const request = result.rows[0];

        res.json({
            id: request.id,
            worker: {
                id: request.worker_id,
                fullName: request.worker_name,
                phoneNumber: request.worker_phone
            },
            contractor: {
                id: request.contractor_id,
                businessName: request.contractor_name
            },
            amount: request.amount,
            category: request.category,
            paymentMode: request.payment_mode,
            purpose: request.purpose,
            notes: request.notes,
            status: request.status,
            modifiedAmount: request.modified_amount,
            modifiedCategory: request.modified_category,
            modificationReason: request.modification_reason,
            reviewedAt: request.reviewed_at,
            rejectionReason: request.rejection_reason,
            createdAt: request.created_at
        });
    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get request details'
            }
        });
    }
};

// Approve payment request (contractor only)
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { modifiedAmount, modifiedCategory, modificationReason } = req.body;

        // Start transaction
        await db.transaction(async (client) => {
            // Get payment request
            const request = await client.query(
                'SELECT * FROM payment_requests WHERE id = $1 FOR UPDATE',
                [id]
            );

            if (request.rows.length === 0) {
                throw new Error('REQUEST_NOT_FOUND');
            }

            const requestData = request.rows[0];

            if (requestData.status !== 'PENDING') {
                throw new Error('REQUEST_ALREADY_REVIEWED');
            }

            // Update payment request
            const finalAmount = modifiedAmount || requestData.amount;
            const finalCategory = modifiedCategory || requestData.category;

            await client.query(
                `UPDATE payment_requests 
         SET status = 'APPROVED',
             modified_amount = $1,
             modified_category = $2,
             modification_reason = $3,
             reviewed_at = NOW(),
             reviewed_by = $4
         WHERE id = $5`,
                [modifiedAmount, modifiedCategory, modificationReason, req.user.id, id]
            );

            // Create transaction
            const transaction = await client.query(
                `INSERT INTO transactions (
          payment_request_id, worker_id, contractor_id, project_id,
          amount, category, payment_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
                [
                    id,
                    requestData.worker_id,
                    requestData.contractor_id,
                    requestData.project_id,
                    finalAmount,
                    finalCategory,
                    requestData.payment_mode
                ]
            );

            const transactionData = transaction.rows[0];

            // Generate UPI link if payment mode is UPI
            let upiLink = null;
            if (requestData.payment_mode === 'UPI') {
                // Get worker UPI ID
                const worker = await client.query(
                    'SELECT upi_id, full_name FROM worker_profiles WHERE id = $1',
                    [requestData.worker_id]
                );

                if (worker.rows[0].upi_id) {
                    upiLink = `upi://pay?pa=${worker.rows[0].upi_id}&pn=${encodeURIComponent(worker.rows[0].full_name)}&am=${finalAmount}&tr=${transactionData.id}&cu=INR`;
                }
            }

            return { transactionData, upiLink };
        }).then(({ transactionData, upiLink }) => {
            res.json({
                success: true,
                paymentRequest: {
                    id,
                    status: 'APPROVED',
                    reviewedAt: new Date()
                },
                transaction: {
                    id: transactionData.id,
                    amount: transactionData.amount,
                    status: transactionData.status,
                    upiLink
                }
            });
        });
    } catch (error) {
        console.error('Approve request error:', error);

        if (error.message === 'REQUEST_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Payment request not found'
                }
            });
        }

        if (error.message === 'REQUEST_ALREADY_REVIEWED') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'REQUEST_ALREADY_REVIEWED',
                    message: 'Request has already been reviewed'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to approve request'
            }
        });
    }
};

// Reject payment request (contractor only)
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REASON',
                    message: 'Rejection reason is required'
                }
            });
        }

        const result = await db.query(
            `UPDATE payment_requests 
       SET status = 'REJECTED',
           rejection_reason = $1,
           reviewed_at = NOW(),
           reviewed_by = $2
       WHERE id = $3 AND status = 'PENDING'
       RETURNING *`,
            [rejectionReason, req.user.id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Payment request not found or already reviewed'
                }
            });
        }

        // TODO: Send notification to worker

        res.json({
            success: true,
            paymentRequest: {
                id: result.rows[0].id,
                status: 'REJECTED',
                reviewedAt: result.rows[0].reviewed_at,
                rejectionReason: result.rows[0].rejection_reason
            }
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to reject request'
            }
        });
    }
};
