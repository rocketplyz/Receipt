export type UrgencyLevel = 'expired' | 'expiring_7d' | 'expiring_30d' | 'safe';

function diffInCalendarDays(later: Date, earlier: Date): number {
  const utcLater = Date.UTC(later.getUTCFullYear(), later.getUTCMonth(), later.getUTCDate());
  const utcEarlier = Date.UTC(
    earlier.getUTCFullYear(),
    earlier.getUTCMonth(),
    earlier.getUTCDate(),
  );
  return Math.round((utcLater - utcEarlier) / (1000 * 60 * 60 * 24));
}

/**
 * Classifies a deadline relative to `now`: overdue, due within 7 days,
 * due within 30 days, or safe. Returns null when there's no deadline to
 * classify (e.g. a purchase with no return window).
 */
export function classifyUrgency(deadline: Date | null, now: Date = new Date()): UrgencyLevel | null {
  if (!deadline) {
    return null;
  }

  const daysRemaining = diffInCalendarDays(deadline, now);

  if (daysRemaining < 0) {
    return 'expired';
  }
  if (daysRemaining <= 7) {
    return 'expiring_7d';
  }
  if (daysRemaining <= 30) {
    return 'expiring_30d';
  }
  return 'safe';
}
