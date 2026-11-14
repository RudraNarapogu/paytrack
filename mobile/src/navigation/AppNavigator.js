import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Worker Screens
import WorkerDashboard from '../screens/worker/WorkerDashboard';
import RequestMoneyScreen from '../screens/worker/RequestMoneyScreen';
import WorkerTransactionsScreen from '../screens/worker/WorkerTransactionsScreen';
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen';

// Contractor Screens
import ContractorDashboard from '../screens/contractor/ContractorDashboard';
import PendingRequestsScreen from '../screens/contractor/PendingRequestsScreen';
import WorkersListScreen from '../screens/contractor/WorkersListScreen';
import AddWorkerScreen from '../screens/contractor/AddWorkerScreen';
import ContractorProfileScreen from '../screens/contractor/ContractorProfileScreen';
import TransactionDetailsScreen from '../screens/contractor/TransactionDetailsScreen';

const Stack = createStackNavigator();

/**
 * Main App Navigator
 * Routes users based on authentication status and role
 */
export default function AppNavigator() {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    // Not authenticated - show auth flow
    if (!isAuthenticated) {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
            </Stack.Navigator>
        );
    }

    // Authenticated - show role-based screens
    const isContractor = user?.role === 'CONTRACTOR';

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6366F1',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {isContractor ? (
                // Contractor Navigation
                <>
                    <Stack.Screen
                        name="ContractorDashboard"
                        component={ContractorDashboard}
                        options={{ title: 'Dashboard' }}
                    />
                    <Stack.Screen
                        name="PendingRequests"
                        component={PendingRequestsScreen}
                        options={{ title: 'Pending Requests' }}
                    />
                    <Stack.Screen
                        name="WorkersList"
                        component={WorkersListScreen}
                        options={{ title: 'Workers' }}
                    />
                    <Stack.Screen
                        name="AddWorker"
                        component={AddWorkerScreen}
                        options={{ title: 'Add Worker' }}
                    />
                    <Stack.Screen
                        name="TransactionDetails"
                        component={TransactionDetailsScreen}
                        options={{ title: 'Transaction Details' }}
                    />
                    <Stack.Screen
                        name="ContractorProfile"
                        component={ContractorProfileScreen}
                        options={{ title: 'Profile' }}
                    />
                </>
            ) : (
                // Worker Navigation
                <>
                    <Stack.Screen
                        name="WorkerDashboard"
                        component={WorkerDashboard}
                        options={{ title: 'My Dashboard' }}
                    />
                    <Stack.Screen
                        name="RequestMoney"
                        component={RequestMoneyScreen}
                        options={{ title: 'Request Money' }}
                    />
                    <Stack.Screen
                        name="WorkerTransactions"
                        component={WorkerTransactionsScreen}
                        options={{ title: 'Transactions' }}
                    />
                    <Stack.Screen
                        name="WorkerProfile"
                        component={WorkerProfileScreen}
                        options={{ title: 'Profile' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
