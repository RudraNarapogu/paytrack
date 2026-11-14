import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Reports.css';

export default function Reports() {
    const [dateRange, setDateRange] = useState({
        startDate: '2026-01-01',
        endDate: '2026-02-08',
    });

    const [reportType, setReportType] = useState('MONTHLY');

    // Sample data
    const monthlyData = {
        totalSpent: 125000,
        salaryPaid: 85000,
        advancesPaid: 35000,
        expensesPaid: 5000,
        totalWorkers: 15,
        activeWorkers: 12,
        transactions: 45,
        avgTransactionAmount: 2778,
    };

    const workerBreakdown = [
        { name: 'Rajesh Kumar', salary: 25000, advances: 5000, total: 30000 },
        { name: 'Priya Sharma', salary: 30000, advances: 0, total: 30000 },
        { name: 'Amit Patel', salary: 22000, advances: 3000, total: 25000 },
        { name: 'Sunita Devi', salary: 20000, advances: 2000, total: 22000 },
        { name: 'Vikram Singh', salary: 28000, advances: 4000, total: 32000 },
    ];

    const categoryBreakdown = [
        { category: 'Salary', amount: 85000, percentage: 68 },
        { category: 'Advances', amount: 35000, percentage: 28 },
        { category: 'Expenses', amount: 5000, percentage: 4 },
    ];

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const handleGenerateReport = () => {
        alert('Report generation feature coming soon! This will export data as PDF/Excel.');
    };

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
                    <Link to="/transactions" className="sidebar-link">
                        💳 Transactions
                    </Link>
                    <Link to="/reports" className="sidebar-link active">
                        📈 Reports
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Financial Reports</h1>
                        <p className="text-muted">Analyze spending patterns and generate reports</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerateReport}>
                        📄 Export Report
                    </button>
                </div>

                {/* Report Controls */}
                <div className="report-controls">
                    <div className="control-group">
                        <label>Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="CUSTOM">Custom Range</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, startDate: e.target.value })
                            }
                        />
                    </div>

                    <div className="control-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, endDate: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="stats-grid mb-lg">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(monthlyData.totalSpent)}</div>
                        <div className="stat-label">Total Spent</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💵</div>
                        <div className="stat-value">{formatCurrency(monthlyData.salaryPaid)}</div>
                        <div className="stat-label">Salary Paid</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏦</div>
                        <div className="stat-value">{formatCurrency(monthlyData.advancesPaid)}</div>
                        <div className="stat-label">Advances Paid</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-value">{monthlyData.transactions}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-grid">
                    {/* Category Breakdown */}
                    <div className="card">
                        <h3>Spending by Category</h3>
                        <div className="chart-container">
                            {categoryBreakdown.map((item, index) => (
                                <div key={index} className="chart-item">
                                    <div className="chart-label">
                                        <span>{item.category}</span>
                                        <span className="text-muted">{item.percentage}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="chart-value">{formatCurrency(item.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Worker Breakdown */}
                    <div className="card">
                        <h3>Top 5 Workers by Spending</h3>
                        <div className="worker-breakdown">
                            {workerBreakdown.map((worker, index) => (
                                <div key={index} className="worker-item">
                                    <div className="worker-rank">{index + 1}</div>
                                    <div className="worker-info">
                                        <strong>{worker.name}</strong>
                                        <div className="worker-details">
                                            <span className="text-muted">
                                                Salary: {formatCurrency(worker.salary)}
                                            </span>
                                            {worker.advances > 0 && (
                                                <span className="text-warning">
                                                    Advances: {formatCurrency(worker.advances)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="worker-total">
                                        {formatCurrency(worker.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="card mt-lg">
                    <h3>Detailed Breakdown</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Total Workers</strong></td>
                                    <td>{monthlyData.totalWorkers}</td>
                                    <td className="text-muted">
                                        {monthlyData.activeWorkers} active, {monthlyData.totalWorkers - monthlyData.activeWorkers} inactive
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Total Transactions</strong></td>
                                    <td>{monthlyData.transactions}</td>
                                    <td className="text-muted">
                                        Avg: {formatCurrency(monthlyData.avgTransactionAmount)}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Salary Payments</strong></td>
                                    <td>{formatCurrency(monthlyData.salaryPaid)}</td>
                                    <td className="text-muted">
                                        {((monthlyData.salaryPaid / monthlyData.totalSpent) * 100).toFixed(1)}% of total
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Advance Payments</strong></td>
                                    <td>{formatCurrency(monthlyData.advancesPaid)}</td>
                                    <td className="text-muted">
                                        {((monthlyData.advancesPaid / monthlyData.totalSpent) * 100).toFixed(1)}% of total
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Expense Payments</strong></td>
                                    <td>{formatCurrency(monthlyData.expensesPaid)}</td>
                                    <td className="text-muted">
                                        {((monthlyData.expensesPaid / monthlyData.totalSpent) * 100).toFixed(1)}% of total
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Export Options */}
                <div className="export-section">
                    <h3>Export Options</h3>
                    <div className="export-buttons">
                        <button className="btn btn-outline" onClick={handleGenerateReport}>
                            📄 Export as PDF
                        </button>
                        <button className="btn btn-outline" onClick={handleGenerateReport}>
                            📊 Export as Excel
                        </button>
                        <button className="btn btn-outline" onClick={handleGenerateReport}>
                            📋 Export as CSV
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
