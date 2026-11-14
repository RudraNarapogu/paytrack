import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    HelperText,
    RadioButton,
    Chip,
} from 'react-native-paper';
import { api } from '../../services/api';
import { theme, spacing } from '../../config/theme';

const CATEGORIES = [
    { value: 'ADVANCE', label: 'Advance', icon: '💰', color: theme.colors.advance },
    { value: 'SALARY', label: 'Salary', icon: '💵', color: theme.colors.salary },
    { value: 'EXPENSE', label: 'Expense', icon: '🧾', color: theme.colors.info },
];

const PAYMENT_MODES = [
    { value: 'CASH', label: 'Cash', icon: '💵', color: theme.colors.cash },
    { value: 'UPI', label: 'UPI', icon: '📱', color: theme.colors.digital },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', color: theme.colors.digital },
];

export default function RequestMoneyScreen({ navigation }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('ADVANCE');
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (parseFloat(amount) > 100000) {
            setError('Amount cannot exceed ₹1,00,000');
            return;
        }

        setLoading(true);

        try {
            await api.paymentRequests.create({
                amount: parseFloat(amount),
                category,
                paymentMode,
                note: note.trim() || undefined,
            });

            // Success - navigate back
            navigation.goBack();
        } catch (err) {
            setError(err.error?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="0"
                            value={amount}
                            onChangeText={(text) => {
                                setAmount(text.replace(/[^0-9.]/g, ''));
                                setError('');
                            }}
                            keyboardType="decimal-pad"
                            style={styles.amountInput}
                            outlineColor={theme.colors.border}
                            activeOutlineColor={theme.colors.primary}
                            error={!!error}
                        />
                    </View>

                    {/* Quick Amount Buttons */}
                    <View style={styles.quickAmounts}>
                        {[500, 1000, 2000, 5000].map((quickAmount) => (
                            <Chip
                                key={quickAmount}
                                mode="outlined"
                                onPress={() => setAmount(quickAmount.toString())}
                                style={styles.quickAmountChip}
                            >
                                ₹{quickAmount}
                            </Chip>
                        ))}
                    </View>
                </View>

                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.optionsGrid}>
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat.value}
                                mode={category === cat.value ? 'contained' : 'outlined'}
                                onPress={() => setCategory(cat.value)}
                                style={[
                                    styles.optionButton,
                                    category === cat.value && { backgroundColor: cat.color },
                                ]}
                                labelStyle={styles.optionLabel}
                            >
                                {cat.icon} {cat.label}
                            </Button>
                        ))}
                    </View>
                </View>

                {/* Payment Mode Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>Payment Mode</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setPaymentMode(value)}
                        value={paymentMode}
                    >
                        {PAYMENT_MODES.map((mode) => (
                            <View key={mode.value} style={styles.radioOption}>
                                <RadioButton.Android value={mode.value} color={theme.colors.primary} />
                                <Text style={styles.radioLabel}>
                                    {mode.icon} {mode.label}
                                </Text>
                            </View>
                        ))}
                    </RadioButton.Group>
                </View>

                {/* Note */}
                <View style={styles.section}>
                    <Text style={styles.label}>Note (Optional)</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Add a note or reason for this request"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        style={styles.noteInput}
                        outlineColor={theme.colors.border}
                        activeOutlineColor={theme.colors.primary}
                    />
                </View>

                {/* Error Message */}
                {error ? (
                    <HelperText type="error" visible={!!error} style={styles.error}>
                        {error}
                    </HelperText>
                ) : null}

                {/* Summary */}
                {amount && parseFloat(amount) > 0 && (
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Request Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Amount:</Text>
                            <Text style={styles.summaryValue}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Category:</Text>
                            <Text style={styles.summaryValue}>{category}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Payment Mode:</Text>
                            <Text style={styles.summaryValue}>{paymentMode.replace('_', ' ')}</Text>
                        </View>
                    </View>
                )}

                {/* Submit Button */}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    style={styles.submitButton}
                    contentStyle={styles.submitButtonContent}
                >
                    Submit Request
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: spacing.md,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.text,
        marginRight: spacing.sm,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '700',
        backgroundColor: theme.colors.surface,
    },
    quickAmounts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    quickAmountChip: {
        marginRight: spacing.sm,
    },
    optionsGrid: {
        gap: spacing.md,
    },
    optionButton: {
        borderRadius: theme.roundness,
    },
    optionLabel: {
        fontSize: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    radioLabel: {
        fontSize: 16,
        color: theme.colors.text,
        marginLeft: spacing.sm,
    },
    noteInput: {
        backgroundColor: theme.colors.surface,
    },
    error: {
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    summary: {
        backgroundColor: theme.colors.primary + '10',
        padding: spacing.lg,
        borderRadius: theme.roundness,
        marginBottom: spacing.lg,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    submitButton: {
        borderRadius: theme.roundness,
    },
    submitButtonContent: {
        paddingVertical: spacing.sm,
    },
});
