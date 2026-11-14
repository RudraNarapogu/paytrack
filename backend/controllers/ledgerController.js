const db = require('../db');

// CRITICAL: Ledger calculation logic
// Worker Balance = Salary Earned - Salary Paid - Advances Given + Adjustments

// Get worker ledger
exports.getWorkerLedger = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { page = 1, limit = 50, entryType } = req.query;
        const offset = (page - 1) * limit;

        // Get worker info
        const worker = await db.query(
            'SELECT full_name FROM worker_profiles WHERE id = $1',
            [workerId]
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

        // Get balance
        const balance = await db.query(
            'SELECT * FROM worker_balances WHERE worker_id = $1',
            [workerId]
        );

        // Get ledger entries
        let query = `
      SELECT * FROM ledger_entries 
      WHERE worker_id = $1
    `;
        const params = [workerId];
        let paramIndex = 2;

        if (entryType) {
            query += ` AND entry_type = $${paramIndex}`;
            params.push(entryType);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const entries = await db.query(query, params);

        res.json({
            workerId,
            workerName: worker.rows[0].full_name,
            balance: balance.rows[0] || {
                salaryEarned: 0,
                salaryPaid: 0,
                advancesGiven: 0,
                outstandingBalance: 0
            },
            entries: entries.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get worker ledger error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get ledger'
            }
        });
    }
};

// Get worker balance
exports.getWorkerBalance = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await db.query(
            'SELECT full_name FROM worker_profiles WHERE id = $1',
            [workerId]
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

        const balance = await db.query(
            'SELECT * FROM worker_balances WHERE worker_id = $1',
            [workerId]
        );

        res.json({
            workerId,
            workerName: worker.rows[0].full_name,
            ...(balance.rows[0] || {
                salaryEarned: 0,
                salaryPaid: 0,
                advancesGiven: 0,
                expensesReimbursed: 0,
                adjustmentCredits: 0,
                adjustmentDebits: 0,
                outstandingBalance: 0
            }),
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Get worker balance error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get balance'
            }
        });
    }
};

// Create adjustment entry (contractor only)
exports.createAdjustment = async (req, res) => {
    try {
        const { workerId, entryType, amount, description } = req.body;

        // Validate entry type
        if (!['ADJUSTMENT_CREDIT', 'ADJUSTMENT_DEBIT'].includes(entryType)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ENTRY_TYPE',
                    message: 'Entry type must be ADJUSTMENT_CREDIT or ADJUSTMENT_DEBIT'
                }
            });
        }

        // Get contractor ID
        const contractor = await db.query(
            'SELECT id FROM contractor_profiles WHERE user_id = $1',
            [req.user.id]
        );

        const contractorId = contractor.rows[0].id;

        // Verify worker belongs to contractor
        const worker = await db.query(
            'SELECT id FROM worker_profiles WHERE id = $1 AND contractor_id = $2',
            [workerId, contractorId]
        );

        if (worker.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Worker does not belong to this contractor'
                }
            });
        }

        // Create ledger entry
        const result = await db.query(
            `INSERT INTO ledger_entries (
        worker_id, contractor_id, entry_type, amount, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
            [workerId, contractorId, entryType, amount, description, req.user.id]
        );

        // Get new balance
        const balance = await db.query(
            'SELECT outstanding_balance FROM worker_balances WHERE worker_id = $1',
            [workerId]
        );

        res.status(201).json({
            success: true,
            ledgerEntry: result.rows[0],
            newBalance: balance.rows[0]?.outstanding_balance || 0
        });
    } catch (error) {
        console.error('Create adjustment error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create adjustment'
            }
        });
    }
};
