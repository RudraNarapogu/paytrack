import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Card, Text, Button, FAB, Chip, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { theme, spacing } from '../../config/theme';

const { width } = Dimensions.get('window');

export default function ContractorDashboard({ navigation }) {
    const { user, logout } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashboardRes, requestsRes] = await Promise.all([
                api.dashboard.getContractorDashboard(),
                api.paymentRequests.list({ status: 'PENDING', limit: 5 }),
            ]);

            setDashboard(dashboardRes.data);
            setPendingRequests(requestsRes.data.requests);
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
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
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
                    <View>
                        <Text style={styles.greeting}>Hello, {user.name}!</Text>
                        <Text style={styles.subGreeting}>Contractor Dashboard</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ContractorProfile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Monthly Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <Text style={styles.summaryLabel}>Total Spent This Month</Text>
                        <Text style={styles.summaryAmount}>
                            {formatCurrency(dashboard?.monthlyStats?.totalSpent)}
                        </Text>

                        <Divider style={styles.divider} />

                        <View style={styles.summaryBreakdown}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryItemValue}>
                                        {formatCurrency(dashboard?.monthlyStats?.salaryPaid)}
                                    </Text>
                                    <Text style={styles.summaryItemLabel}>Salary</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryItemValue, { color: theme.colors.warning }]}>
                                        {formatCurrency(dashboard?.monthlyStats?.advancesGiven)}
                                    </Text>
                                    <Text style={styles.summaryItemLabel}>Advances</Text>
                                </View>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statIcon}>👥</Text>
                            <Text style={styles.statValue}>
                                {dashboard?.totalWorkers || 0}
                            </Text>
                            <Text style={styles.statLabel}>Workers</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statIcon}>⏳</Text>
                            <Text style={styles.statValue}>
                                {pendingRequests.length}
                            </Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statIcon}>💳</Text>
                            <Text style={styles.statValue}>
                                {dashboard?.monthlyStats?.transactionCount || 0}
                            </Text>
                            <Text style={styles.statLabel}>Transactions</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('PendingRequests')}
                        >
                            <Text style={styles.actionIcon}>📋</Text>
                            <Text style={styles.actionLabel}>Pending Requests</Text>
                            {pendingRequests.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('WorkersList')}
                        >
                            <Text style={styles.actionIcon}>👥</Text>
                            <Text style={styles.actionLabel}>Manage Workers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AddWorker')}
                        >
                            <Text style={styles.actionIcon}>➕</Text>
                            <Text style={styles.actionLabel}>Add Worker</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pending Requests Preview */}
                {pendingRequests.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Pending Requests</Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('PendingRequests')}
                            >
                                View All
                            </Button>
                        </View>

                        {pendingRequests.slice(0, 3).map((request) => (
                            <Card
                                key={request.id}
                                style={styles.requestCard}
                                onPress={() => navigation.navigate('PendingRequests')}
                            >
                                <Card.Content>
                                    <View style={styles.requestHeader}>
                                        <View>
                                            <Text style={styles.requestWorkerName}>
                                                {request.workerName}
                                            </Text>
                                            <Text style={styles.requestAmount}>
                                                {formatCurrency(request.amount)}
                                            </Text>
                                        </View>
                                        <Chip
                                            style={{ backgroundColor: theme.colors.warning + '20' }}
                                            textStyle={{ color: theme.colors.warning }}
                                        >
                                            {request.category}
                                        </Chip>
                                    </View>

                                    {request.note && (
                                        <Text style={styles.requestNote} numberOfLines={2}>
                                            {request.note}
                                        </Text>
                                    )}
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Worker-wise Breakdown */}
                {dashboard?.workerBreakdown && dashboard.workerBreakdown.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Workers (This Month)</Text>
                        {dashboard.workerBreakdown.slice(0, 5).map((worker, index) => (
                            <Card key={worker.workerId} style={styles.workerCard}>
                                <Card.Content>
                                    <View style={styles.workerRow}>
                                        <View style={styles.workerInfo}>
                                            <Text style={styles.workerRank}>#{index + 1}</Text>
                                            <Text style={styles.workerName}>{worker.workerName}</Text>
                                        </View>
                                        <Text style={styles.workerAmount}>
                                            {formatCurrency(worker.totalPaid)}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <FAB
                icon="plus"
                label="Add Worker"
                style={styles.fab}
                onPress={() => navigation.navigate('AddWorker')}
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
    subGreeting: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: spacing.xs,
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
    summaryCard: {
        margin: spacing.lg,
        marginTop: 0,
        backgroundColor: theme.colors.primary,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    summaryAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    divider: {
        marginVertical: spacing.md,
        backgroundColor: '#fff',
        opacity: 0.2,
    },
    summaryBreakdown: {},
    summaryRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    summaryItem: {
        flex: 1,
    },
    summaryItemValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: spacing.xs,
    },
    summaryItemLabel: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 28,
        marginBottom: spacing.xs,
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
        marginBottom: spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    actionLabel: {
        fontSize: 12,
        color: theme.colors.text,
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -spacing.xs,
        right: -spacing.xs,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    requestCard: {
        marginBottom: spacing.md,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    requestWorkerName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: spacing.xs,
    },
    requestAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    requestNote: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    workerCard: {
        marginBottom: spacing.sm,
    },
    workerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workerRank: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginRight: spacing.md,
    },
    workerName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    workerAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    fab: {
        position: 'absolute',
        margin: spacing.lg,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
});
