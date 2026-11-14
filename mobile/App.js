import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';

/**
 * PayTrack Mobile Application
 * Main entry point for the React Native app
 */
export default function App() {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </AuthProvider>
        </PaperProvider>
    );
}
