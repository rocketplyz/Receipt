import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { deletePurchase, getPurchase, updatePurchase } from '../../../src/features/purchases/api';
import { PurchaseForm } from '../../../src/features/purchases/components/PurchaseForm';
import type { Purchase } from '../../../src/features/purchases/types';
import { useThemeColors } from '../../../src/theme/colors';

export default function PurchaseDetail() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getPurchase(id)
      .then(setPurchase)
      .catch((error) =>
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load purchase.'),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  function confirmDelete() {
    Alert.alert('Delete purchase?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePurchase(id);
          router.back();
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (errorMessage || !purchase) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.danger }}>{errorMessage ?? 'Purchase not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PurchaseForm
        initialPurchase={purchase}
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await updatePurchase(purchase.id, input);
          router.back();
        }}
      />
      <Pressable accessibilityRole="button" style={styles.deleteRow} onPress={confirmDelete}>
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Delete purchase</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
