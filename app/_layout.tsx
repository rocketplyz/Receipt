import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { handleAuthDeepLink } from '../src/lib/auth';
import { SessionProvider, useSession } from '../src/lib/session-context';

function RootNavigator() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthDeepLink(url).catch((error) => {
        console.error('Failed to complete sign-in link', error);
      });
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleAuthDeepLink(url).catch((error) => {
          console.error('Failed to complete sign-in link', error);
        });
      }
    });

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={session === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
