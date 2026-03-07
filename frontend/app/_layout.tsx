/*import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { initApiUrl } from '../src/services/api';

export default function RootLayout() {
  useEffect(() => {
    initApiUrl();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="whatsapp-settings" />
        <Stack.Screen name="server-config" />
      </Stack>
    </AuthProvider>
  );
}*/


import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { initApiUrl } from '../src/services/api';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    initApiUrl();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="whatsapp-settings" />
          <Stack.Screen name="server-config" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
