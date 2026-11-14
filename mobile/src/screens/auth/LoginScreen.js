import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../config/theme';

export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { sendOTP } = useAuth();

    const validatePhone = (phoneNumber) => {
        // Indian phone number validation
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handleSendOTP = async () => {
        setError('');

        if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);

        const result = await sendOTP(`+91${phone}`);

        setLoading(false);

        if (result.success) {
            navigation.navigate('OTP', { phone: `+91${phone}` });
        } else {
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
                {/* Logo/Branding */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>💰</Text>
                    </View>
                    <Text style={styles.title}>PayTrack</Text>
                    <Text style={styles.subtitle}>Smart Payments. Clean Records.</Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>Enter your mobile number</Text>

                    <View style={styles.phoneInputContainer}>
                        <View style={styles.countryCode}>
                            <Text style={styles.countryCodeText}>+91</Text>
                        </View>
                        <TextInput
                            mode="outlined"
                            placeholder="9876543210"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text.replace(/[^0-9]/g, ''));
                                setError('');
                            }}
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={styles.phoneInput}
                            outlineColor={theme.colors.border}
                            activeOutlineColor={theme.colors.primary}
                            error={!!error}
                        />
                    </View>

                    {error ? (
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleSendOTP}
                        loading={loading}
                        disabled={loading || phone.length !== 10}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Send OTP
                    </Button>

                    <Text style={styles.disclaimer}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Secure • Encrypted • Trusted
                    </Text>
                </View>
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
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoText: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    form: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: spacing.md,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    countryCode: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 4,
        marginRight: spacing.sm,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    phoneInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: spacing.md,
        borderRadius: theme.roundness,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    disclaimer: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
});
