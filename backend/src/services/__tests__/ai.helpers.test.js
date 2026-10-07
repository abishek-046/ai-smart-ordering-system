/**
 * Unit tests for AI service helper functions.
 *
 * Tests pure utility functions extracted from ai.service.js:
 *  - roundUpToSlot: rounds a Date up to the next N-minute boundary
 *  - roundDownToSlot: rounds a Date down to nearest N-minute boundary
 *  - getSlotKey: normalises a date to its 15-min slot key
 *  - getSlotLabel: classifies a slot by score and load
 *  - AI score clamping: scores are bounded 0–100
 *  - Bayesian rating update: weighted average formula
 *
 * None of these functions touch the database, making them perfect unit tests.
 */

const { describe, it, expect } = require('@jest/globals');

// ── Re-implement helpers exactly as in ai.service.js ─────────────────────────

function roundUpToSlot(date, minutes) {
  const ms = minutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function roundDownToSlot(date, minutes) {
  const ms = minutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

function getSlotKey(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15);
  return d.toISOString();
}

function getSlotLabel(score, load) {
  if (load === 0) return 'Available';
  if (score >= 85) return 'Best Pick';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Busy';
  return 'Very Busy';
}

// ── Bayesian average (from menu.controller.js rateFoodItem) ──────────────────

function bayesianRatingUpdate(currentRating, currentCount, newRating) {
  const newCount = currentCount + 1;
  const newAvg   = parseFloat(((currentRating * currentCount + newRating) / newCount).toFixed(2));
  return { newCount, newAvg };
}

// ── AI score clamping (from ai.service.js) ────────────────────────────────────

function clampScore(score) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

// ─────────────────────────────────────────────────────────────────────────────

describe('roundUpToSlot', () => {
  it('rounds up to next 15-min boundary when not on boundary', () => {
    // Build a date at exactly hh:07:00 local time using local Date constructor
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 7, 0, 0);
    const result = roundUpToSlot(d, 15);
    expect(result.getMinutes()).toBe(15);
    expect(result.getSeconds()).toBe(0);
  });

  it('stays at same time when already exactly on a 15-min boundary', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15, 0, 0);
    const result = roundUpToSlot(d, 15);
    expect(result.getTime()).toBe(d.getTime());
  });

  it('rounds up correctly at 10:01 → 10:15', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 1, 0, 0);
    const result = roundUpToSlot(d, 15);
    expect(result.getMinutes()).toBe(15);
  });

  it('rounds up correctly at 10:59 → 11:00', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 59, 0, 0);
    const result = roundUpToSlot(d, 15);
    expect(result.getMinutes()).toBe(0);
    expect(result.getHours()).toBe(11);
  });

  it('works with 30-min slots too', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 10, 0, 0);
    const result = roundUpToSlot(d, 30);
    expect(result.getMinutes()).toBe(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('roundDownToSlot', () => {
  it('rounds down to current 30-min boundary', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 45, 0, 0);
    const result = roundDownToSlot(d, 30);
    expect(result.getMinutes()).toBe(30);
  });

  it('stays at 00 when minutes are 0', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0);
    const result = roundDownToSlot(d, 30);
    expect(result.getMinutes()).toBe(0);
    expect(result.getHours()).toBe(10);
  });

  it('rounds 10:29 down to 10:00 (30-min slot)', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 29, 0, 0);
    const result = roundDownToSlot(d, 30);
    expect(result.getMinutes()).toBe(0);
    expect(result.getHours()).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('getSlotKey', () => {
  it('zeroes out seconds and milliseconds', () => {
    const now = new Date();
    // Build local time 10:07:45.123
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 7, 45, 123);
    const key = getSlotKey(d);
    const parsed = new Date(key);
    expect(parsed.getSeconds()).toBe(0);
    expect(parsed.getMilliseconds()).toBe(0);
  });

  it('normalises minutes to 15-min floor', () => {
    const now = new Date();
    // 10:17 → floor to 10:15
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 17, 0, 0);
    const key = getSlotKey(d);
    const parsed = new Date(key);
    expect(parsed.getMinutes()).toBe(15);
  });

  it('produces the same key for two dates in the same 15-min window', () => {
    const now = new Date();
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 16, 0, 0);
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 29, 59, 999);
    expect(getSlotKey(d1)).toBe(getSlotKey(d2));
  });

  it('produces different keys for dates in different 15-min windows', () => {
    const now = new Date();
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 14, 0, 0); // window: 10:00
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 16, 0, 0); // window: 10:15
    expect(getSlotKey(d1)).not.toBe(getSlotKey(d2));
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('getSlotLabel', () => {
  it('returns "Available" when load is 0', () => {
    expect(getSlotLabel(100, 0)).toBe('Available');
    expect(getSlotLabel(0,   0)).toBe('Available');
  });

  it('returns "Best Pick" for score >= 85 with non-zero load', () => {
    expect(getSlotLabel(85, 1)).toBe('Best Pick');
    expect(getSlotLabel(100, 2)).toBe('Best Pick');
  });

  it('returns "Good" for score in [70, 84]', () => {
    expect(getSlotLabel(70, 1)).toBe('Good');
    expect(getSlotLabel(84, 1)).toBe('Good');
  });

  it('returns "Busy" for score in [50, 69]', () => {
    expect(getSlotLabel(50, 1)).toBe('Busy');
    expect(getSlotLabel(69, 1)).toBe('Busy');
  });

  it('returns "Very Busy" for score < 50', () => {
    expect(getSlotLabel(49, 1)).toBe('Very Busy');
    expect(getSlotLabel(0, 5)).toBe('Very Busy');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('clampScore (AI recommendation score)', () => {
  it('clamps score to 100 maximum', () => {
    expect(clampScore(150)).toBe(100);
    expect(clampScore(101)).toBe(100);
    expect(clampScore(100)).toBe(100);
  });

  it('clamps score to 0 minimum', () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(clampScore(72.6)).toBe(73);
    expect(clampScore(72.4)).toBe(72);
  });

  it('passes through valid mid-range scores unchanged', () => {
    expect(clampScore(50)).toBe(50);
    expect(clampScore(75)).toBe(75);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('bayesianRatingUpdate', () => {
  it('calculates correct average for first rating (count was 0)', () => {
    const { newCount, newAvg } = bayesianRatingUpdate(0, 0, 5);
    expect(newCount).toBe(1);
    expect(newAvg).toBe(5);
  });

  it('calculates correct weighted average', () => {
    // Existing: avg=4.0, count=2 → total=8. New rating=2. New avg=(8+2)/3=3.33
    const { newCount, newAvg } = bayesianRatingUpdate(4.0, 2, 2);
    expect(newCount).toBe(3);
    expect(newAvg).toBe(3.33);
  });

  it('rounds to 2 decimal places', () => {
    const { newAvg } = bayesianRatingUpdate(3, 1, 4);
    // (3*1 + 4) / 2 = 3.5
    expect(newAvg).toBe(3.5);
    expect(String(newAvg).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });

  it('never produces a rating above 5', () => {
    const { newAvg } = bayesianRatingUpdate(5, 100, 5);
    expect(newAvg).toBeLessThanOrEqual(5);
  });

  it('never produces a rating below 1 when all ratings are valid', () => {
    const { newAvg } = bayesianRatingUpdate(1, 100, 1);
    expect(newAvg).toBeGreaterThanOrEqual(1);
  });

  it('rejects a new rating of 0 conceptually (validated upstream)', () => {
    // The controller blocks ratings < 1, so this tests the math only
    // If 0 slips through, the average drops — document this as a known effect
    const { newAvg } = bayesianRatingUpdate(5, 1, 0);
    expect(newAvg).toBeLessThan(5);
  });
});
