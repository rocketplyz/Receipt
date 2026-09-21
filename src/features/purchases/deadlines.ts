import type { PurchaseCategory } from '../../lib/database.types';

export type MerchantPolicyLookup = Record<string, number>;
export type CategoryDefaultLookup = Partial<Record<PurchaseCategory, number>>;

const DEFAULT_RETURN_DAYS = 30;
const DEFAULT_WARRANTY_MONTHS = 12;

/** Adds `days` calendar days to `date`, ignoring time-of-day. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Adds `months` calendar months to `date`. Clamps to the last day of the
 * target month when the source day doesn't exist there (e.g. Jan 31 + 1
 * month lands on Feb 28, or Feb 29 in a leap year — never overflowing
 * into March).
 */
export function addMonths(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const targetMonthFirst = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetMonthFirst.getUTCFullYear(), targetMonthFirst.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      targetMonthFirst.getUTCFullYear(),
      targetMonthFirst.getUTCMonth(),
      Math.min(day, lastDayOfTargetMonth),
    ),
  );
}

function normalizeMerchantKey(merchant: string): string {
  return merchant.trim().toLowerCase();
}

/**
 * Return-window deadline: purchase date + the matched merchant's
 * `default_return_days`, or `fallbackDays` when the merchant is unknown
 * or unset.
 */
export function calculateReturnDeadline(
  purchaseDate: Date,
  merchant: string | null | undefined,
  merchantPolicies: MerchantPolicyLookup,
  fallbackDays: number = DEFAULT_RETURN_DAYS,
): Date {
  const key = merchant ? normalizeMerchantKey(merchant) : undefined;
  const days = key !== undefined && key in merchantPolicies ? merchantPolicies[key] : fallbackDays;
  return addDays(purchaseDate, days);
}

/**
 * Warranty deadline: purchase date + the category's
 * `default_warranty_months`, or `fallbackMonths` when the category has no
 * configured default.
 */
export function calculateWarrantyExpires(
  purchaseDate: Date,
  category: PurchaseCategory,
  categoryDefaults: CategoryDefaultLookup,
  fallbackMonths: number = DEFAULT_WARRANTY_MONTHS,
): Date {
  const months = categoryDefaults[category] ?? fallbackMonths;
  return addMonths(purchaseDate, months);
}
