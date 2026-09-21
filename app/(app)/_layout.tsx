import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Purchases' }} />
      <Stack.Screen name="purchase/new" options={{ title: 'Add purchase', presentation: 'modal' }} />
      <Stack.Screen name="purchase/[id]" options={{ title: 'Edit purchase' }} />
    </Stack>
  );
}
