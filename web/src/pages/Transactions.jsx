import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Transactions.css';

export default function Transactions() {
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            workerName: 'Rajesh Kumar',
            amount: 5000,
            category: 'ADVANCE',
            paymentMode: 'UPI',
            status: 'COMPLETED',
            date: '2026-02-05',
            time: '14:30',
        },
        {
            id: 2,
            workerName: 'Priya Sharma',
            amount: 15000,
            category: 'SALARY',
            paymentMode: 'BANK_TRANSFER',
            status: 'COMPLETED',
            date: '2026-02-01',
            time: '10:00',
        },
        {
            id: 3,
            workerName: 'Amit Patel',
            amount: 3000,
            category: 'ADVANCE',
            paymentMode: 'CASH',
            status: 'PENDING',
            date: '2026-02-08',
            time: '16:45',
        },
        {
            id: 4,
            workerName: 'Rajesh Kumar',
            amount: 2000,
            category: 'EXPENSE',
            paymentMode: 'UPI',
            status: 'COMPLETED',
            date: '2026-02-03',
            time: '11:20',
        },
        {
            id: 5,
            workerName: 'Priya Sharma',
            amount: 5000,
            category: 'ADVANCE',
            paymentMode: 'CASH',
            status: 'COMPLETED',
            date: '2026-01-28',
            time: '09:15',
        },
    ]);

    const [filters, setFilters] = useState({
        category: 'ALL',
        paymentMode: 'ALL',
        status: 'ALL',
        search: '',
    });

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (status) => {
        const classes = {
            COMPLETED: 'badge-success',
            PENDING: 'badge-warning',
            FAILED: 'badge-error',
        };
        return `badge ${classes[status] || 'badge-info'}`;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            SALARY: '💰',
            ADVANCE: '🏦',
            EXPENSE: '📝',
        };
        return icons[category] || '💳';
    };

    const filteredTransactions = transactions.filter((txn) => {
        const matchesCategory = filters.category === 'ALL' || txn.category === filters.category;
        const matchesPaymentMode = filters.paymentMode === 'ALL' || txn.paymentMode === filters.paymentMode;
        const matchesStatus = filters.status === 'ALL' || txn.status === filters.status;
        const matchesSearch = txn.workerName.toLowerCase().includes(filters.search.toLowerCase());

        return matchesCategory && matchesPaymentMode && matchesStatus && matchesSearch;
    });

    const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const completedCount = filteredTransactions.filter(t => t.status === 'COMPLETED').length;
    const pendingCount = filteredTransactions.filter(t => t.status === 'PENDING').length;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>💰 PayTrack</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link">
                        📊 Dashboard
                    </Link>
                    <Link to="/workers" className="sidebar-link">
                        👥 Workers
                    </Link>
                    <Link to="/transactions" className="sidebar-link active">
                        💳 Transactions
                    </Link>
                    <Link to="/reports" className="sidebar-link">
                        📈 Reports
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Transactions</h1>
                        <p className="text-muted">View and manage all payment transactions</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid mb-lg">
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-value">{filteredTransactions.length}</div>
                        <div className="stat-label">Total Transactions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(totalAmount)}</div>
                        <div className="stat-label">Total Amount</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="🔍 Search by worker name..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="ALL">All Categories</option>
                            <option value="SALARY">Salary</option>
                            <option value="ADVANCE">Advance</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Payment Mode</label>
                        <select
                            value={filters.paymentMode}
                            onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
                        >
                            <option value="ALL">All Modes</option>
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="ALL">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-outline"
                        onClick={() => setFilters({ category: 'ALL', paymentMode: 'ALL', status: 'ALL', search: '' })}
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Transactions Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Worker</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                                <th>Status</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td className="text-muted">#{txn.id}</td>
                                    <td><strong>{txn.workerName}</strong></td>
                                    <td>
                                        <span className="category-badge">
                                            {getCategoryIcon(txn.category)} {txn.category}
                                        </span>
                                    </td>
                                    <td className="text-primary"><strong>{formatCurrency(txn.amount)}</strong></td>
                                    <td>{txn.paymentMode.replace('_', ' ')}</td>
                                    <td>
                                        <span className={getStatusBadge(txn.status)}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="text-muted">
                                        {txn.date}<br />
                                        <small>{txn.time}</small>
                                    </td>
                                    <td>
                                        <button className="btn-icon" title="View Details">
                                            👁️
                                        </button>
                                        {txn.status === 'PENDING' && (
                                            <button className="btn-icon" title="Confirm">
                                                ✅
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTransactions.length === 0 && (
                        <div className="empty-state">
                            <p>No transactions found matching your filters</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
