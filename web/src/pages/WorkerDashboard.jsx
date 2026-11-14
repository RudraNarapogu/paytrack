import React, { useState, useEffect } from 'react';
import './WorkerDashboard.css';

const API_URL = 'http://localhost:3000/api/v1';

export default function WorkerDashboard({ onLogout }) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [userName, setUserName] = useState('Worker');

    useEffect(() => {
        const name = localStorage.getItem('userName');
        if (name) setUserName(name);
        fetchWorkerData();
    }, []);

    const fetchWorkerData = async () => {
        try {
            const token = localStorage.getItem('authToken');

            // Fetch worker balance
            const balanceRes = await fetch(`${API_URL}/workers/balance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                setBalance(balanceData.balance || 0);
            }

            // Fetch recent transactions
            const txnRes = await fetch(`${API_URL}/workers/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (txnRes.ok) {
                const txnData = await txnRes.json();
                setTransactions(txnData.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching worker data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            onLogout();
            window.location.href = '/login';
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="worker-dashboard">
            {/* Header */}
            <header className="worker-header">
                <div className="header-content">
                    <h1>💰 PayTrack</h1>
                    <div className="header-actions">
                        <span className="user-name">👤 {userName}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="worker-content">
                {/* Balance Card */}
                <div className="balance-card">
                    <div className="balance-header">
                        <h2>Your Balance</h2>
                        <span className="badge badge-info">WORKER</span>
                    </div>
                    <div className={`balance-amount ${balance < 0 ? 'negative' : 'positive'}`}>
                        {balance < 0 ? '-' : '+'}
                        {formatCurrency(balance)}
                    </div>
                    <p className="balance-description">
                        {balance < 0
                            ? `You have received ₹${formatCurrency(balance)} in advances`
                            : balance > 0
                                ? `You are owed ₹${formatCurrency(balance)}`
                                : 'Your account is settled'}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="action-card">
                        <div className="action-icon">💸</div>
                        <div className="action-label">Request Money</div>
                    </button>
                    <button className="action-card">
                        <div className="action-icon">📊</div>
                        <div className="action-label">View Salary</div>
                    </button>
                    <button className="action-card">
                        <div className="action-icon">📜</div>
                        <div className="action-label">History</div>
                    </button>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <h3>Recent Transactions</h3>
                    {transactions.length > 0 ? (
                        <div className="transactions-list">
                            {transactions.map((txn) => (
                                <div key={txn.id} className="transaction-item">
                                    <div className="txn-icon">
                                        {txn.category === 'SALARY' ? '💰' :
                                            txn.category === 'ADVANCE' ? '🏦' : '📝'}
                                    </div>
                                    <div className="txn-details">
                                        <strong>{txn.category}</strong>
                                        <small className="text-muted">{txn.date}</small>
                                    </div>
                                    <div className={`txn-amount ${txn.amount > 0 ? 'positive' : 'negative'}`}>
                                        {txn.amount > 0 ? '+' : ''}
                                        {formatCurrency(txn.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>

                {/* Info Cards */}
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-icon">📅</div>
                        <div className="info-content">
                            <div className="info-label">This Month</div>
                            <div className="info-value">₹0</div>
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">💳</div>
                        <div className="info-content">
                            <div className="info-label">Transactions</div>
                            <div className="info-value">{transactions.length}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
