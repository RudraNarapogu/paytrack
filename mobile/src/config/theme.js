import { DefaultTheme } from 'react-native-paper';

/**
 * PayTrack Brand Theme
 * Premium fintech design system
 */
export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#6366F1', // Indigo - Trust & professionalism
        secondary: '#10B981', // Emerald - Success & money
        accent: '#F59E0B', // Amber - Attention & warnings
        background: '#F9FAFB', // Light gray
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        border: '#E5E7EB',
        disabled: '#D1D5DB',

        // Custom fintech colors
        salary: '#8B5CF6', // Purple
        advance: '#F59E0B', // Amber
        cash: '#10B981', // Green
        digital: '#3B82F6', // Blue
    },
    roundness: 12,
    fonts: {
        ...DefaultTheme.fonts,
        regular: {
            fontFamily: 'System',
            fontWeight: '400',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        bold: {
            fontFamily: 'System',
            fontWeight: '700',
        },
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
};
