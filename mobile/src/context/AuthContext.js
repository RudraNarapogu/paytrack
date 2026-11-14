import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Load user from storage on app start
     */
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const [storedUser, accessToken] = await AsyncStorage.multiGet([
                'user',
                'accessToken',
            ]);

            if (storedUser[1] && accessToken[1]) {
                setUser(JSON.parse(storedUser[1]));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Send OTP to phone number
     */
    const sendOTP = async (phone) => {
        try {
            const response = await api.auth.sendOTP(phone);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.error?.message || 'Failed to send OTP'
            };
        }
    };

    /**
     * Verify OTP and login
     */
    const verifyOTP = async (phone, otp) => {
        try {
            const response = await api.auth.verifyOTP(phone, otp);
            const { user: userData, accessToken, refreshToken } = response.data;

            // Store tokens and user data
            await AsyncStorage.multiSet([
                ['user', JSON.stringify(userData)],
                ['accessToken', accessToken],
                ['refreshToken', refreshToken],
            ]);

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.error?.message || 'Invalid OTP'
            };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (data) => {
        try {
            const response = await api.users.updateProfile(data);
            const updatedUser = response.data;

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return { success: true, user: updatedUser };
        } catch (error) {
            return {
                success: false,
                error: error.error?.message || 'Failed to update profile'
            };
        }
    };

    /**
     * Refresh user data
     */
    const refreshUser = async () => {
        try {
            const response = await api.users.getMe();
            const userData = response.data;

            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.error?.message || 'Failed to refresh user data'
            };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        sendOTP,
        verifyOTP,
        logout,
        updateProfile,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
