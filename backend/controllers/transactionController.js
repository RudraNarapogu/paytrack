const db = require('../db');

// Confirm cash payment (contractor only)
exports.confirmCashPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await db.transaction(async (client) => {
            // Get transaction
            const transaction = await client.query(
                'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
                [id]
            );

            if (transaction.rows.length === 0) {
                throw new Error('TRANSACTION_NOT_FOUND');
            }

            const txn = transaction.rows[0];

            if (txn.status !== 'PENDING') {
                throw new Error('TRANSACTION_NOT_PENDING');
            }

            if (txn.payment_mode !== 'CASH') {
                throw new Error('NOT_CASH_PAYMENT');
            }

            // Update transaction
            await client.query(
                `UPDATE transactions 
         SET status = 'COMPLETED',
             cash_confirmed_at = NOW(),
             cash_confirmed_by = $1,
             completed_at = NOW()
         WHERE id = $2`,
                [req.user.id, id]
            );

            // Create ledger entry
            const entryType = txn.category === 'SALARY' ? 'SALARY_PAID' :
                txn.category === 'EXPENSE' ? 'EXPENSE_REIMBURSED' :
                    'ADVANCE_GIVEN';

            await client.query(
                `INSERT INTO ledger_entries (
          worker_id, contractor_id, transaction_id,
          entry_type, amount, description, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    txn.worker_id,
                    txn.contractor_id,
                    id,
                    entryType,
                    txn.amount,
                    `${txn.category} payment - ${txn.payment_mode}`,
                    req.user.id
                ]
            );

            return txn;
        }).then((txn) => {
            res.json({
                success: true,
                transaction: {
                    id: txn.id,
                    status: 'COMPLETED',
                    cashConfirmedAt: new Date()
                }
            });
        });
    } catch (error) {
        console.error('Confirm cash payment error:', error);

        if (error.message === 'TRANSACTION_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TRANSACTION_NOT_FOUND',
                    message: 'Transaction not found'
                }
            });
        }

        if (error.message === 'TRANSACTION_NOT_PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TRANSACTION_NOT_PENDING',
                    message: 'Transaction is not in pending status'
                }
            });
        }

        if (error.message === 'NOT_CASH_PAYMENT') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NOT_CASH_PAYMENT',
                    message: 'This is not a cash payment'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to confirm cash payment'
            }
        });
    }
};

// List transactions
exports.listTransactions = async (req, res) => {
    try {
        const { workerId, category, paymentMode, status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        t.*,
        w.full_name as worker_name
      FROM transactions t
      JOIN worker_profiles w ON t.worker_id = w.id
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
            query += ` AND t.contractor_id = $${paramIndex}`;
            params.push(contractor.rows[0].id);
            paramIndex++;
        } else if (req.user.role === 'WORKER') {
            const worker = await db.query(
                'SELECT id FROM worker_profiles WHERE user_id = $1',
                [req.user.id]
            );
            query += ` AND t.worker_id = $${paramIndex}`;
            params.push(worker.rows[0].id);
            paramIndex++;
        }

        // Apply filters
        if (workerId) {
            query += ` AND t.worker_id = $${paramIndex}`;
            params.push(workerId);
            paramIndex++;
        }

        if (category) {
            query += ` AND t.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (paymentMode) {
            query += ` AND t.payment_mode = $${paramIndex}`;
            params.push(paymentMode);
            paramIndex++;
        }

        if (status) {
            query += ` AND t.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const transactions = await db.query(query, params);

        res.json({
            transactions: transactions.rows.map(t => ({
                id: t.id,
                worker: {
                    id: t.worker_id,
                    fullName: t.worker_name
                },
                amount: t.amount,
                category: t.category,
                paymentMode: t.payment_mode,
                status: t.status,
                completedAt: t.completed_at,
                createdAt: t.created_at
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('List transactions error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to list transactions'
            }
        });
    }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
        t.*,
        w.full_name as worker_name,
        cp.business_name as contractor_name
      FROM transactions t
      JOIN worker_profiles w ON t.worker_id = w.id
      JOIN contractor_profiles cp ON t.contractor_id = cp.id
      WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TRANSACTION_NOT_FOUND',
                    message: 'Transaction not found'
                }
            });
        }

        const txn = result.rows[0];

        // Get ledger entries
        const ledger = await db.query(
            'SELECT * FROM ledger_entries WHERE transaction_id = $1',
            [id]
        );

        res.json({
            id: txn.id,
            paymentRequestId: txn.payment_request_id,
            worker: {
                id: txn.worker_id,
                fullName: txn.worker_name
            },
            contractor: {
                id: txn.contractor_id,
                businessName: txn.contractor_name
            },
            amount: txn.amount,
            category: txn.category,
            paymentMode: txn.payment_mode,
            status: txn.status,
            upiTransactionId: txn.upi_transaction_id,
            bankReferenceNumber: txn.bank_reference_number,
            cashConfirmedAt: txn.cash_confirmed_at,
            completedAt: txn.completed_at,
            createdAt: txn.created_at,
            ledgerEntries: ledger.rows
        });
    } catch (error) {
        console.error('Get transaction details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get transaction details'
            }
        });
    }
};
