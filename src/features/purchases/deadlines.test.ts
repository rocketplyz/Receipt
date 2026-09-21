import { describe, expect, it } from 'vitest';

import { addDays, addMonths, calculateReturnDeadline, calculateWarrantyExpires } from './deadlines';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

describe('addDays', () => {
  it('adds days within the same month', () => {
    expect(addDays(utc(2024, 1, 1), 10)).toEqual(utc(2024, 1, 11));
  });

  it('crosses a month boundary', () => {
    expect(addDays(utc(2024, 1, 25), 10)).toEqual(utc(2024, 2, 4));
  });

  it('crosses a year boundary', () => {
    expect(addDays(utc(2023, 12, 28), 10)).toEqual(utc(2024, 1, 7));
  });

  it('supports zero days', () => {
    expect(addDays(utc(2024, 6, 15), 0)).toEqual(utc(2024, 6, 15));
  });
});

describe('addMonths', () => {
  it('adds months within the same year', () => {
    expect(addMonths(utc(2024, 3, 15), 2)).toEqual(utc(2024, 5, 15));
  });

  it('clamps Jan 31 + 1 month to Feb 28 in a non-leap year', () => {
    expect(addMonths(utc(2023, 1, 31), 1)).toEqual(utc(2023, 2, 28));
  });

  it('clamps Jan 31 + 1 month to Feb 29 in a leap year', () => {
    expect(addMonths(utc(2024, 1, 31), 1)).toEqual(utc(2024, 2, 29));
  });

  it('rolls over into the next year', () => {
    expect(addMonths(utc(2023, 12, 15), 2)).toEqual(utc(2024, 2, 15));
  });

  it('clamps across a multi-year, multi-month jump landing on a leap February', () => {
    expect(addMonths(utc(2023, 1, 31), 13)).toEqual(utc(2024, 2, 29));
  });
});

describe('calculateReturnDeadline', () => {
  const merchantPolicies = { 'best buy': 15, amazon: 30 };

  it('uses the matched merchant policy, normalizing case and whitespace', () => {
    const result = calculateReturnDeadline(utc(2024, 1, 1), '  Best Buy  ', merchantPolicies);
    expect(result).toEqual(utc(2024, 1, 16));
  });

  it('falls back to the default when the merchant is unknown', () => {
    const result = calculateReturnDeadline(utc(2024, 1, 1), 'Some Random Shop', merchantPolicies);
    expect(result).toEqual(utc(2024, 1, 31));
  });

  it('falls back to the default when no merchant is given', () => {
    const result = calculateReturnDeadline(utc(2024, 1, 1), undefined, merchantPolicies);
    expect(result).toEqual(utc(2024, 1, 31));
  });

  it('honors a custom fallback', () => {
    const result = calculateReturnDeadline(utc(2024, 1, 1), null, merchantPolicies, 60);
    expect(result).toEqual(utc(2024, 3, 1));
  });
});

describe('calculateWarrantyExpires', () => {
  const categoryDefaults = { electronics: 12, appliance: 24 };

  it('uses the matched category default', () => {
    const result = calculateWarrantyExpires(utc(2024, 1, 15), 'appliance', categoryDefaults);
    expect(result).toEqual(utc(2026, 1, 15));
  });

  it('falls back to the default when the category has no configured default', () => {
    const result = calculateWarrantyExpires(utc(2024, 1, 15), 'furniture', categoryDefaults);
    expect(result).toEqual(utc(2025, 1, 15));
  });
});
