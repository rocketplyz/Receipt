import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signOut } from '../../src/lib/auth';
import { PurchaseListItem } from '../../src/features/purchases/components/PurchaseListItem';
import { listPurchases } from '../../src/features/purchases/api';
import type { Purchase } from '../../src/features/purchases/types';
import { useThemeColors } from '../../src/theme/colors';

export default function PurchasesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const load = useCallback(async (query: string) => {
    if (!hasLoadedOnceRef.current) setIsLoading(true);
    setErrorMessage(null);
    try {
      setPurchases(await listPurchases(query));
      hasLoadedOnceRef.current = true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load purchases.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(searchQuery);
    }, [load, searchQuery]),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search item, merchant, or notes"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.searchInput,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.danger, textAlign: 'center', paddingHorizontal: 24 }}>
            {errorMessage}
          </Text>
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchQuery ? 'No matching purchases' : 'No purchases yet'}
          </Text>
          {!searchQuery ? (
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Add your first purchase to start tracking return windows and warranties.
            </Text>
          ) : null}
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={purchases}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                load(searchQuery);
              }}
            />
          }
          renderItem={({ item }) => <PurchaseListItem purchase={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <Pressable
        accessibilityRole="button"
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => router.push('/purchase/new')}
      >
        <Text style={styles.fabText}>+ Add purchase</Text>
      </Pressable>

      <Pressable accessibilityRole="button" style={styles.signOut} onPress={() => signOut()}>
        <Text style={{ color: colors.textMuted }}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 72,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  signOut: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
