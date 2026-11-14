import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Workers.css';

export default function Workers() {
    const [workers, setWorkers] = useState([
        {
            id: 1,
            name: 'Rajesh Kumar',
            phone: '+919876543210',
            monthlySalary: 25000,
            balance: -5000,
            status: 'ACTIVE',
            joinedDate: '2026-01-15',
        },
        {
            id: 2,
            name: 'Priya Sharma',
            phone: '+919876543211',
            monthlySalary: 30000,
            balance: 12000,
            status: 'ACTIVE',
            joinedDate: '2026-01-10',
        },
        {
            id: 3,
            name: 'Amit Patel',
            phone: '+919876543212',
            monthlySalary: 22000,
            balance: -2000,
            status: 'ACTIVE',
            joinedDate: '2026-01-20',
        },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newWorker, setNewWorker] = useState({
        name: '',
        phone: '',
        monthlySalary: '',
        upiId: '',
    });

    const formatCurrency = (amount) => {
        return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
    };

    const getBalanceClass = (balance) => {
        if (balance > 0) return 'balance-positive';
        if (balance < 0) return 'balance-negative';
        return 'balance-zero';
    };

    const handleAddWorker = (e) => {
        e.preventDefault();
        const worker = {
            id: workers.length + 1,
            name: newWorker.name,
            phone: newWorker.phone,
            monthlySalary: parseInt(newWorker.monthlySalary),
            balance: 0,
            status: 'ACTIVE',
            joinedDate: new Date().toISOString().split('T')[0],
        };
        setWorkers([...workers, worker]);
        setNewWorker({ name: '', phone: '', monthlySalary: '', upiId: '' });
        setShowAddForm(false);
    };

    const filteredWorkers = workers.filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm)
    );

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
                    <Link to="/workers" className="sidebar-link active">
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
                    <div>
                        <h1>Workers Management</h1>
                        <p className="text-muted">Manage your team and track payments</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        ➕ Add Worker
                    </button>
                </div>

                {/* Add Worker Form */}
                {showAddForm && (
                    <div className="card mb-lg">
                        <h3>Add New Worker</h3>
                        <form onSubmit={handleAddWorker} className="worker-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={newWorker.name}
                                        onChange={(e) =>
                                            setNewWorker({ ...newWorker, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={newWorker.phone}
                                        onChange={(e) =>
                                            setNewWorker({ ...newWorker, phone: e.target.value })
                                        }
                                        placeholder="+919876543210"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Monthly Salary *</label>
                                    <input
                                        type="number"
                                        value={newWorker.monthlySalary}
                                        onChange={(e) =>
                                            setNewWorker({
                                                ...newWorker,
                                                monthlySalary: e.target.value,
                                            })
                                        }
                                        placeholder="25000"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>UPI ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={newWorker.upiId}
                                        onChange={(e) =>
                                            setNewWorker({ ...newWorker, upiId: e.target.value })
                                        }
                                        placeholder="worker@paytm"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Add Worker
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Search workers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Workers Stats */}
                <div className="stats-grid mb-lg">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{workers.length}</div>
                        <div className="stat-label">Total Workers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">
                            {workers.filter((w) => w.status === 'ACTIVE').length}
                        </div>
                        <div className="stat-label">Active Workers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">
                            {formatCurrency(
                                workers.reduce((sum, w) => sum + w.monthlySalary, 0)
                            )}
                        </div>
                        <div className="stat-label">Total Monthly Salary</div>
                    </div>
                </div>

                {/* Workers Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Worker</th>
                                <th>Phone</th>
                                <th>Monthly Salary</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkers.map((worker) => (
                                <tr key={worker.id}>
                                    <td>
                                        <strong>{worker.name}</strong>
                                    </td>
                                    <td className="text-muted">{worker.phone}</td>
                                    <td>{formatCurrency(worker.monthlySalary)}</td>
                                    <td>
                                        <span className={getBalanceClass(worker.balance)}>
                                            {worker.balance > 0 ? '+' : worker.balance < 0 ? '-' : ''}
                                            {formatCurrency(worker.balance)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-success">{worker.status}</span>
                                    </td>
                                    <td className="text-muted">{worker.joinedDate}</td>
                                    <td>
                                        <button className="btn-icon" title="View Details">
                                            👁️
                                        </button>
                                        <button className="btn-icon" title="Edit">
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredWorkers.length === 0 && (
                        <div className="empty-state">
                            <p>No workers found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
