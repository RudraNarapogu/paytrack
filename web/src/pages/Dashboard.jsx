import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSpent: 125000,
        salaryPaid: 85000,
        advancesGiven: 40000,
        totalWorkers: 12,
        pendingRequests: 3,
        transactions: 45,
    });

    const [recentTransactions, setRecentTransactions] = useState([
        {
            id: 1,
            workerName: 'Rajesh Kumar',
            amount: 5000,
            category: 'ADVANCE',
            status: 'APPROVED',
            date: '2026-01-24',
        },
        {
            id: 2,
            workerName: 'Priya Sharma',
            amount: 15000,
            category: 'SALARY',
            status: 'APPROVED',
            date: '2026-01-23',
        },
        {
            id: 3,
            workerName: 'Amit Patel',
            amount: 3000,
            category: 'ADVANCE',
            status: 'PENDING',
            date: '2026-01-22',
        },
    ]);

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (status) => {
        const classes = {
            APPROVED: 'badge-success',
            PENDING: 'badge-warning',
            REJECTED: 'badge-error',
        };
        return `badge ${classes[status] || 'badge-info'}`;
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>💰 PayTrack</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link active">
                        📊 Dashboard
                    </Link>
                    <Link to="/workers" className="sidebar-link">
                        👥 Workers
                    </Link>
                    <Link to="/transactions" className="sidebar-link">
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
                    <h1>Dashboard</h1>
                    <p className="text-muted">Welcome back! Here's your overview.</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
                        <div className="stat-label">Total Spent (This Month)</div>
                        <div className="stat-change positive">
                            ↑ 12% from last month
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💵</div>
                        <div className="stat-value">{formatCurrency(stats.salaryPaid)}</div>
                        <div className="stat-label">Salary Paid</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🏦</div>
                        <div className="stat-value">{formatCurrency(stats.advancesGiven)}</div>
                        <div className="stat-label">Advances Given</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{stats.totalWorkers}</div>
                        <div className="stat-label">Total Workers</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-value">{stats.pendingRequests}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-value">{stats.transactions}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="section">
                    <div className="section-header">
                        <h2>Recent Transactions</h2>
                        <Link to="/transactions" className="btn btn-outline">
                            View All
                        </Link>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Worker</th>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((txn) => (
                                    <tr key={txn.id}>
                                        <td>{txn.workerName}</td>
                                        <td className="text-primary">{formatCurrency(txn.amount)}</td>
                                        <td>{txn.category}</td>
                                        <td>
                                            <span className={getStatusBadge(txn.status)}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="text-muted">{txn.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section">
                    <h2>Quick Actions</h2>
                    <div className="grid grid-3">
                        <Link to="/workers" className="action-card">
                            <div className="action-icon">➕</div>
                            <h3>Add Worker</h3>
                            <p className="text-muted">Register a new worker</p>
                        </Link>

                        <Link to="/transactions" className="action-card">
                            <div className="action-icon">📋</div>
                            <h3>Pending Requests</h3>
                            <p className="text-muted">Review payment requests</p>
                        </Link>

                        <Link to="/reports" className="action-card">
                            <div className="action-icon">📊</div>
                            <h3>Generate Report</h3>
                            <p className="text-muted">Export financial data</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
