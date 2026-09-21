import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../../theme/colors';
import type { UrgencyLevel } from '../urgency';

const LABELS: Record<UrgencyLevel, string> = {
  expired: 'Expired',
  expiring_7d: 'Due within 7 days',
  expiring_30d: 'Due within 30 days',
  safe: 'Safe',
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel | null }) {
  const colors = useThemeColors();
  if (!urgency) {
    return null;
  }

  const color =
    urgency === 'expired'
      ? colors.danger
      : urgency === 'expiring_7d'
        ? colors.danger
        : urgency === 'expiring_30d'
          ? colors.warning
          : colors.safe;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.text, { color }]}>{LABELS[urgency]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
