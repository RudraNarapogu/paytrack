import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Login({ setAuth, setUserRole }) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        if (token && role) {
            setAuth(true);
            setUserRole(role);
            navigate(role === 'WORKER' ? '/worker-dashboard' : '/dashboard');
        }
    }, [setAuth, setUserRole, navigate]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep('otp');
                // For testing, show OTP in console
                console.log('OTP sent! For testing, use: 000000');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please check if backend is running.');
            console.error('Send OTP error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save auth data to localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.profile?.name || 'User');

                setAuth(true);
                setUserRole(data.user.role);

                // Redirect based on role
                if (data.user.role === 'WORKER') {
                    navigate('/worker-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please check if backend is running.');
            console.error('Verify OTP error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>💰 PayTrack</h1>
                    <p>Contractor Payment Tracking System</p>
                </div>

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {step === 'phone' ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+919876543210"
                                required
                                disabled={loading}
                            />
                            <small className="text-muted">
                                Enter your registered phone number
                            </small>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <div className="login-footer">
                            <p className="text-muted">
                                For testing, use OTP: <strong>000000</strong>
                            </p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                maxLength="6"
                                required
                                disabled={loading}
                                autoFocus
                            />
                            <small className="text-muted">
                                Sent to {phone}
                            </small>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline btn-block"
                            onClick={() => {
                                setStep('phone');
                                setOtp('');
                                setError('');
                            }}
                            disabled={loading}
                        >
                            ← Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
