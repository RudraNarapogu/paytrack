import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../config/theme';

export default function ContractorProfileScreen() {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.phone}>{user.phone}</Text>
                <Text style={styles.role}>Contractor</Text>

                <Button
                    mode="contained"
                    onPress={logout}
                    style={styles.logoutButton}
                >
                    Logout
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: spacing.sm,
    },
    phone: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: spacing.xs,
    },
    role: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: spacing.lg,
    },
    logoutButton: {
        marginTop: spacing.lg,
    },
});
