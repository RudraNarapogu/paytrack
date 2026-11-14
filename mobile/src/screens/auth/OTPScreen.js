import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput as RNTextInput,
} from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../config/theme';

export default function OTPScreen({ route, navigation }) {
    const { phone } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const { verifyOTP, sendOTP } = useAuth();

    // Refs for OTP inputs
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleOTPChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (index === 5 && value) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (otpCode = otp.join('')) => {
        if (otpCode.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setLoading(true);

        const result = await verifyOTP(phone, otpCode);

        setLoading(false);

        if (!result.success) {
            setError(result.error);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
        // If successful, AuthContext will handle navigation
    };

    const handleResendOTP = async () => {
        setError('');
        setResendTimer(30);

        const result = await sendOTP(phone);

        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={styles.phone}>{phone}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <RNTextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                                error && styles.otpInputError,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOTPChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {error ? (
                    <HelperText type="error" visible={!!error} style={styles.error}>
                        {error}
                    </HelperText>
                ) : null}

                {/* Verify Button */}
                <Button
                    mode="contained"
                    onPress={() => handleVerifyOTP()}
                    loading={loading}
                    disabled={loading || otp.join('').length !== 6}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Verify OTP
                </Button>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code?</Text>
                    {resendTimer > 0 ? (
                        <Text style={styles.timer}>Resend in {resendTimer}s</Text>
                    ) : (
                        <Button
                            mode="text"
                            onPress={handleResendOTP}
                            style={styles.resendButton}
                        >
                            Resend OTP
                        </Button>
                    )}
                </View>

                {/* Back Button */}
                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    Change Phone Number
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
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: spacing.xxl * 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    phone: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text,
        backgroundColor: theme.colors.surface,
    },
    otpInputFilled: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '10',
    },
    otpInputError: {
        borderColor: theme.colors.error,
    },
    error: {
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    button: {
        marginTop: spacing.md,
        borderRadius: theme.roundness,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    resendText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: spacing.xs,
    },
    timer: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    resendButton: {
        marginTop: -spacing.sm,
    },
    backButton: {
        marginTop: spacing.md,
    },
});
