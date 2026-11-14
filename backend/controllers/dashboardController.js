const db = require('../db');

// Contractor dashboard
exports.getContractorDashboard = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Get contractor ID
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

        // Get summary statistics
        const summary = await db.query(
            `SELECT 
        COUNT(DISTINCT t.id) as total_transactions,
        COUNT(DISTINCT t.worker_id) as active_workers,
        COALESCE(SUM(t.amount), 0) as total_spent,
        COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'PENDING') as pending_requests
      FROM transactions t
      LEFT JOIN payment_requests pr ON pr.contractor_id = $1 AND pr.status = 'PENDING'
      WHERE t.contractor_id = $1
        AND t.status = 'COMPLETED'
        AND t.created_at >= COALESCE($2::timestamptz, DATE_TRUNC('month', CURRENT_DATE))
        AND t.created_at <= COALESCE($3::timestamptz, CURRENT_DATE)`,
            [contractorId, startDate, endDate]
        );

        // Get breakdown by category
        const categoryBreakdown = await db.query(
            `SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE contractor_id = $1
        AND status = 'COMPLETED'
        AND created_at >= COALESCE($2::timestamptz, DATE_TRUNC('month', CURRENT_DATE))
        AND created_at <= COALESCE($3::timestamptz, CURRENT_DATE)
      GROUP BY category`,
            [contractorId, startDate, endDate]
        );

        // Get breakdown by payment mode
        const paymentModeBreakdown = await db.query(
            `SELECT 
        payment_mode,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE contractor_id = $1
        AND status = 'COMPLETED'
        AND created_at >= COALESCE($2::timestamptz, DATE_TRUNC('month', CURRENT_DATE))
        AND created_at <= COALESCE($3::timestamptz, CURRENT_DATE)
      GROUP BY payment_mode`,
            [contractorId, startDate, endDate]
        );

        // Get worker-wise spend
        const workerWiseSpend = await db.query(
            `SELECT 
        w.id as worker_id,
        w.full_name as worker_name,
        COALESCE(SUM(t.amount), 0) as total_spent,
        COALESCE(SUM(CASE WHEN t.category = 'ADVANCE' THEN t.amount ELSE 0 END), 0) as advances_given,
        COALESCE(SUM(CASE WHEN t.category = 'SALARY' THEN t.amount ELSE 0 END), 0) as salary_paid
      FROM worker_profiles w
      LEFT JOIN transactions t ON w.id = t.worker_id 
        AND t.status = 'COMPLETED'
        AND t.created_at >= COALESCE($2::timestamptz, DATE_TRUNC('month', CURRENT_DATE))
        AND t.created_at <= COALESCE($3::timestamptz, CURRENT_DATE)
      WHERE w.contractor_id = $1
      GROUP BY w.id, w.full_name
      ORDER BY total_spent DESC
      LIMIT 10`,
            [contractorId, startDate, endDate]
        );

        // Get recent activity
        const recentActivity = await db.query(
            `SELECT 
        t.*,
        w.full_name as worker_name
      FROM transactions t
      JOIN worker_profiles w ON t.worker_id = w.id
      WHERE t.contractor_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10`,
            [contractorId]
        );

        res.json({
            summary: {
                totalSpent: parseFloat(summary.rows[0].total_spent),
                totalWorkers: parseInt(summary.rows[0].active_workers),
                activeWorkers: parseInt(summary.rows[0].active_workers),
                pendingRequests: parseInt(summary.rows[0].pending_requests),
                completedTransactions: parseInt(summary.rows[0].total_transactions)
            },
            breakdown: {
                byCategory: categoryBreakdown.rows.reduce((acc, row) => {
                    acc[row.category.toLowerCase()] = parseFloat(row.total);
                    return acc;
                }, {}),
                byPaymentMode: paymentModeBreakdown.rows.reduce((acc, row) => {
                    acc[row.payment_mode.toLowerCase()] = parseFloat(row.total);
                    return acc;
                }, {})
            },
            workerWiseSpend: workerWiseSpend.rows,
            recentActivity: recentActivity.rows
        });
    } catch (error) {
        console.error('Get contractor dashboard error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get dashboard data'
            }
        });
    }
};

// Worker dashboard
exports.getWorkerDashboard = async (req, res) => {
    try {
        const { period = 'MONTH' } = req.query;

        // Get worker profile
        const worker = await db.query(
            'SELECT id FROM worker_profiles WHERE user_id = $1',
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

        const workerId = worker.rows[0].id;

        // Get current balance
        const balance = await db.query(
            'SELECT * FROM worker_balances WHERE worker_id = $1',
            [workerId]
        );

        // Get monthly summary
        const monthlySummary = await db.query(
            `SELECT 
        DATE_TRUNC('month', CURRENT_DATE) as month,
        COALESCE(SUM(amount), 0) as total_received,
        COALESCE(SUM(CASE WHEN category = 'SALARY' THEN amount ELSE 0 END), 0) as salary_received,
        COALESCE(SUM(CASE WHEN category = 'ADVANCE' THEN amount ELSE 0 END), 0) as advances_received,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE worker_id = $1
        AND status = 'COMPLETED'
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            [workerId]
        );

        // Get lifetime summary
        const lifetimeSummary = await db.query(
            `SELECT 
        COALESCE(SUM(amount), 0) as total_received,
        COALESCE(SUM(CASE WHEN category = 'SALARY' THEN amount ELSE 0 END), 0) as salary_received,
        COALESCE(SUM(CASE WHEN category = 'ADVANCE' THEN amount ELSE 0 END), 0) as advances_received,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE worker_id = $1 AND status = 'COMPLETED'`,
            [workerId]
        );

        // Get recent transactions
        const recentTransactions = await db.query(
            `SELECT * FROM transactions 
       WHERE worker_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
            [workerId]
        );

        // Get pending requests
        const pendingRequests = await db.query(
            `SELECT * FROM payment_requests 
       WHERE worker_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC`,
            [workerId]
        );

        res.json({
            currentBalance: balance.rows[0] || {
                salaryEarned: 0,
                salaryPaid: 0,
                advancesGiven: 0,
                outstandingBalance: 0
            },
            monthlySummary: {
                month: monthlySummary.rows[0].month,
                totalReceived: parseFloat(monthlySummary.rows[0].total_received),
                salaryReceived: parseFloat(monthlySummary.rows[0].salary_received),
                advancesReceived: parseFloat(monthlySummary.rows[0].advances_received),
                transactionCount: parseInt(monthlySummary.rows[0].transaction_count)
            },
            lifetimeSummary: {
                totalReceived: parseFloat(lifetimeSummary.rows[0].total_received),
                salaryReceived: parseFloat(lifetimeSummary.rows[0].salary_received),
                advancesReceived: parseFloat(lifetimeSummary.rows[0].advances_received),
                transactionCount: parseInt(lifetimeSummary.rows[0].transaction_count)
            },
            recentTransactions: recentTransactions.rows,
            pendingRequests: pendingRequests.rows
        });
    } catch (error) {
        console.error('Get worker dashboard error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to get dashboard data'
            }
        });
    }
};
