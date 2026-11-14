import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Configuration
 */
const API_BASE_URL = __DEV__
    ? 'http://localhost:3000/api/v1'
    : 'https://api.paytrack.app/api/v1';

/**
 * Axios instance with interceptors
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - Add JWT token
 */
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle errors
 */
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired, try to refresh
            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    await AsyncStorage.setItem('accessToken', accessToken);

                    // Retry original request
                    error.config.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient.request(error.config);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                // Navigate to login (handled by AuthContext)
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

/**
 * API Service Methods
 */
export const api = {
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================

    auth: {
        sendOTP: (phoneNumber) => apiClient.post('/auth/send-otp', { phoneNumber }),
        verifyOTP: (phoneNumber, otp) => apiClient.post('/auth/verify-otp', { phoneNumber, otp }),
        refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
    },

    // ============================================================================
    // USERS
    // ============================================================================

    users: {
        getMe: () => apiClient.get('/users/me'),
        updateProfile: (data) => apiClient.patch('/users/me', data),
        getContractor: (id) => apiClient.get(`/contractors/${id}`),
        getWorker: (id) => apiClient.get(`/workers/${id}`),
        createWorker: (data) => apiClient.post('/workers', data),
        listWorkers: (params) => apiClient.get('/workers', { params }),
        updateWorker: (id, data) => apiClient.patch(`/workers/${id}`, data),
    },

    // ============================================================================
    // PAYMENT REQUESTS
    // ============================================================================

    paymentRequests: {
        create: (data) => apiClient.post('/payment-requests', data),
        list: (params) => apiClient.get('/payment-requests', { params }),
        getById: (id) => apiClient.get(`/payment-requests/${id}`),
        approve: (id, data) => apiClient.patch(`/payment-requests/${id}/approve`, data),
        reject: (id, reason) => apiClient.patch(`/payment-requests/${id}/reject`, { reason }),
        modify: (id, data) => apiClient.patch(`/payment-requests/${id}/modify`, data),
    },

    // ============================================================================
    // TRANSACTIONS
    // ============================================================================

    transactions: {
        list: (params) => apiClient.get('/transactions', { params }),
        getById: (id) => apiClient.get(`/transactions/${id}`),
        confirmCash: (id) => apiClient.post(`/transactions/${id}/confirm-cash`),
    },

    // ============================================================================
    // LEDGER
    // ============================================================================

    ledger: {
        getWorkerLedger: (workerId, params) =>
            apiClient.get(`/ledger/worker/${workerId}`, { params }),
        getWorkerBalance: (workerId) =>
            apiClient.get(`/ledger/worker/${workerId}/balance`),
        createAdjustment: (data) =>
            apiClient.post('/ledger/adjustments', data),
    },

    // ============================================================================
    // DASHBOARD
    // ============================================================================

    dashboard: {
        getContractorDashboard: (params) =>
            apiClient.get('/dashboard/contractor', { params }),
        getWorkerDashboard: (params) =>
            apiClient.get('/dashboard/worker', { params }),
    },

    // ============================================================================
    // PROJECTS
    // ============================================================================

    projects: {
        create: (data) => apiClient.post('/projects', data),
        list: (params) => apiClient.get('/projects', { params }),
        getById: (id) => apiClient.get(`/projects/${id}`),
        update: (id, data) => apiClient.patch(`/projects/${id}`, data),
        assignWorker: (id, workerId) =>
            apiClient.post(`/projects/${id}/workers`, { workerId }),
    },
};

export default api;
