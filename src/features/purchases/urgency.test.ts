import { describe, expect, it } from 'vitest';

import { classifyUrgency } from './urgency';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

describe('classifyUrgency', () => {
  const now = utc(2024, 6, 1);

  it('returns null when there is no deadline', () => {
    expect(classifyUrgency(null, now)).toBeNull();
  });

  it('classifies a past deadline as expired', () => {
    expect(classifyUrgency(utc(2024, 5, 31), now)).toBe('expired');
  });

  it('classifies today as expiring within 7 days', () => {
    expect(classifyUrgency(utc(2024, 6, 1), now)).toBe('expiring_7d');
  });

  it('classifies exactly 7 days out as expiring within 7 days', () => {
    expect(classifyUrgency(utc(2024, 6, 8), now)).toBe('expiring_7d');
  });

  it('classifies 8 days out as expiring within 30 days', () => {
    expect(classifyUrgency(utc(2024, 6, 9), now)).toBe('expiring_30d');
  });

  it('classifies exactly 30 days out as expiring within 30 days', () => {
    expect(classifyUrgency(utc(2024, 7, 1), now)).toBe('expiring_30d');
  });

  it('classifies 31 days out as safe', () => {
    expect(classifyUrgency(utc(2024, 7, 2), now)).toBe('safe');
  });

  it('classifies a far-future deadline as safe', () => {
    expect(classifyUrgency(utc(2025, 1, 1), now)).toBe('safe');
  });
});
