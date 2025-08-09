import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from './providers/AuthProvider';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading, hasAuthError } = useAuth();

  // Jika ada auth error atau tidak ada session, arahkan ke (auth)
  const shouldShowAuth = !session || hasAuthError;

  // Debug logging
  useEffect(() => {
    console.log('🎯 RootLayoutNav - Auth State Debug:');
    console.log('  - Session:', session ? `✅ ${session.user?.email}` : '❌ None');
    console.log('  - Loading:', isLoading);
    console.log('  - Has Error:', hasAuthError);
    console.log('  - Should Show Auth:', shouldShowAuth);
  }, [session, isLoading, hasAuthError, shouldShowAuth]);

  if (isLoading) {
    console.log('⏳ RootLayoutNav - Still loading...');
    return null; // Atau tambahkan loading screen custom
  }

  console.log('🚀 RootLayoutNav - Navigating to:', shouldShowAuth ? '(auth)' : '(tabs)');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {shouldShowAuth ? <Stack.Screen name="(auth)" options={{ headerShown: false }} /> : <Stack.Screen name="(tabs)" options={{ headerShown: false }} />}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
