import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, FAB, Chip, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { theme, spacing } from '../../config/theme';
import { format } from 'date-fns';

export default function WorkerDashboard({ navigation }) {
    const { user, logout } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [balance, setBalance] = useState(null);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashboardRes, balanceRes, requestsRes] = await Promise.all([
                api.dashboard.getWorkerDashboard(),
                api.ledger.getWorkerBalance(user.workerId),
                api.paymentRequests.list({ limit: 5 }),
            ]);

            setDashboard(dashboardRes.data);
            setBalance(balanceRes.data);
            setRecentRequests(requestsRes.data.requests);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return theme.colors.success;
            case 'REJECTED':
                return theme.colors.error;
            case 'PENDING':
                return theme.colors.warning;
            default:
                return theme.colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, {user.name}!</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('WorkerProfile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <Card style={styles.balanceCard}>
                    <Card.Content>
                        <Text style={styles.balanceLabel}>Outstanding Balance</Text>
                        <Text style={[
                            styles.balanceAmount,
                            {
                                color: balance?.outstandingBalance >= 0
                                    ? theme.colors.success
                                    : theme.colors.error
                            }
                        ]}>
                            {formatCurrency(balance?.outstandingBalance || 0)}
                        </Text>

                        <Divider style={styles.divider} />

                        <View style={styles.balanceBreakdown}>
                            <View style={styles.balanceRow}>
                                <Text style={styles.balanceRowLabel}>Salary Earned</Text>
                                <Text style={styles.balanceRowValue}>
                                    {formatCurrency(balance?.salaryEarned || 0)}
                                </Text>
                            </View>
                            <View style={styles.balanceRow}>
                                <Text style={styles.balanceRowLabel}>Salary Paid</Text>
                                <Text style={styles.balanceRowValue}>
                                    {formatCurrency(balance?.salaryPaid || 0)}
                                </Text>
                            </View>
                            <View style={styles.balanceRow}>
                                <Text style={styles.balanceRowLabel}>Advances Taken</Text>
                                <Text style={[styles.balanceRowValue, { color: theme.colors.warning }]}>
                                    {formatCurrency(balance?.advancesGiven || 0)}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statValue}>
                                {formatCurrency(dashboard?.monthlyStats?.totalReceived || 0)}
                            </Text>
                            <Text style={styles.statLabel}>This Month</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statValue}>
                                {dashboard?.monthlyStats?.requestCount || 0}
                            </Text>
                            <Text style={styles.statLabel}>Requests</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Recent Requests */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Requests</Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('WorkerTransactions')}
                        >
                            View All
                        </Button>
                    </View>

                    {recentRequests.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content>
                                <Text style={styles.emptyText}>No requests yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Tap the + button to request money
                                </Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        recentRequests.map((request) => (
                            <Card key={request.id} style={styles.requestCard}>
                                <Card.Content>
                                    <View style={styles.requestHeader}>
                                        <View>
                                            <Text style={styles.requestAmount}>
                                                {formatCurrency(request.amount)}
                                            </Text>
                                            <Text style={styles.requestCategory}>
                                                {request.category}
                                            </Text>
                                        </View>
                                        <Chip
                                            style={{ backgroundColor: getStatusColor(request.status) + '20' }}
                                            textStyle={{ color: getStatusColor(request.status) }}
                                        >
                                            {request.status}
                                        </Chip>
                                    </View>

                                    <Text style={styles.requestDate}>
                                        {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                                    </Text>

                                    {request.note && (
                                        <Text style={styles.requestNote}>{request.note}</Text>
                                    )}
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <FAB
                icon="plus"
                label="Request Money"
                style={styles.fab}
                onPress={() => navigation.navigate('RequestMoney')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    balanceCard: {
        margin: spacing.lg,
        marginTop: 0,
        backgroundColor: theme.colors.primary,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    divider: {
        marginVertical: spacing.md,
        backgroundColor: '#fff',
        opacity: 0.2,
    },
    balanceBreakdown: {
        gap: spacing.sm,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    balanceRowLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    balanceRowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    section: {
        padding: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    emptyCard: {
        padding: spacing.lg,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    requestCard: {
        marginBottom: spacing.md,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    requestAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    requestCategory: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: spacing.xs,
    },
    requestDate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: spacing.xs,
    },
    requestNote: {
        fontSize: 14,
        color: theme.colors.text,
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        margin: spacing.lg,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
});
