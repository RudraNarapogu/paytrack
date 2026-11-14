import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import WorkerDashboard from './pages/WorkerDashboard';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to={userRole === 'WORKER' ? '/worker-dashboard' : '/dashboard'} replace /> :
                                <Login setAuth={setIsAuthenticated} setUserRole={setUserRole} />
                        }
                    />

                    {isAuthenticated ? (
                        <>
                            {/* Contractor Routes */}
                            {userRole === 'CONTRACTOR' && (
                                <>
                                    <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
                                    <Route path="/workers" element={<Workers onLogout={handleLogout} />} />
                                    <Route path="/transactions" element={<Transactions onLogout={handleLogout} />} />
                                    <Route path="/reports" element={<Reports onLogout={handleLogout} />} />
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                </>
                            )}

                            {/* Worker Routes */}
                            {userRole === 'WORKER' && (
                                <>
                                    <Route path="/worker-dashboard" element={<WorkerDashboard onLogout={handleLogout} />} />
                                    <Route path="/" element={<Navigate to="/worker-dashboard" replace />} />
                                </>
                            )}

                            {/* Fallback for authenticated users */}
                            <Route path="*" element={<Navigate to={userRole === 'WORKER' ? '/worker-dashboard' : '/dashboard'} replace />} />
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    )}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
