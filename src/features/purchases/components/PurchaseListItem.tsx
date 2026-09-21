import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../../theme/colors';
import { nextDeadline } from '../api';
import type { Purchase } from '../types';
import { classifyUrgency } from '../urgency';
import { UrgencyBadge } from './UrgencyBadge';

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function PurchaseListItem({ purchase }: { purchase: Purchase }) {
  const colors = useThemeColors();
  const deadline = nextDeadline(purchase);
  const urgency = deadline ? classifyUrgency(new Date(`${deadline}T00:00:00Z`)) : null;

  return (
    <Link href={{ pathname: '/purchase/[id]', params: { id: purchase.id } }} asChild>
      <Pressable
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {purchase.itemName}
          </Text>
          <UrgencyBadge urgency={urgency} />
        </View>
        {purchase.merchant ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{purchase.merchant}</Text>
        ) : null}
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Purchased {formatDate(purchase.purchaseDate)}
          {deadline ? ` · next deadline ${formatDate(deadline)}` : ''}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
  },
});
