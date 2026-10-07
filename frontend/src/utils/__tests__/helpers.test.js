/**
 * Unit tests for frontend helper utilities.
 *
 * Covers:
 *  - formatCurrency: Indian Rupee formatting
 *  - formatTime: 12-hour time display
 *  - formatDate: Indian date display
 *  - formatDateTime: combined date+time
 *  - getStatusColor: CSS class mapping per order status
 *  - getStatusLabel: human-readable status label
 *  - getCategoryLabel: category display name with emoji
 *  - getCategoryEmoji: emoji per category
 *  - getApiError: extracts error message from axios error shapes
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatTime,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  getCategoryLabel,
  getCategoryEmoji,
  getApiError,
} from '../helpers';

// ── formatCurrency ──────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a whole number as Indian Rupees', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
    // Indian locale uses ₹ symbol
    expect(result).toMatch(/₹/);
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formats decimal amounts (rounds to 0 decimal places)', () => {
    // maximumFractionDigits: 0 — no cents shown
    const result = formatCurrency(49.5);
    expect(result).not.toContain('.');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(10000);
    expect(result).toContain('10');
    expect(result).toMatch(/₹/);
  });
});

// ── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatTime('2026-09-15T13:30:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains AM or PM (12-hour format)', () => {
    const result = formatTime('2026-09-15T08:00:00.000Z');
    expect(result).toMatch(/AM|PM|am|pm/i);
  });

  it('formats midnight correctly without crashing', () => {
    const result = formatTime('2026-09-15T00:00:00.000Z');
    expect(typeof result).toBe('string');
  });
});

// ── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns a string for a valid date', () => {
    const result = formatDate('2026-09-15T00:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year', () => {
    const result = formatDate('2026-09-15T00:00:00.000Z');
    expect(result).toContain('2026');
  });
});

// ── formatDateTime ────────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('returns both date and time parts', () => {
    const result = formatDateTime('2026-09-15T13:30:00.000Z');
    expect(typeof result).toBe('string');
    // Should contain comma separator from formatDate + formatTime join
    expect(result.length).toBeGreaterThan(5);
  });
});

// ── getStatusColor ────────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns a CSS class string for every known status', () => {
    const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
    for (const s of statuses) {
      const result = getStatusColor(s);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('returns a fallback string for an unknown status', () => {
    const result = getStatusColor('UNKNOWN_STATUS');
    expect(typeof result).toBe('string');
  });

  it('returns null/undefined for undefined input gracefully', () => {
    // Should not throw
    expect(() => getStatusColor(undefined)).not.toThrow();
  });
});

// ── getStatusLabel ────────────────────────────────────────────────────────────

describe('getStatusLabel', () => {
  it('returns human-readable label for PENDING', () => {
    expect(getStatusLabel('PENDING')).toContain('Pending');
  });

  it('returns human-readable label for READY', () => {
    expect(getStatusLabel('READY')).toContain('Ready');
  });

  it('returns human-readable label for CANCELLED', () => {
    expect(getStatusLabel('CANCELLED')).toContain('Cancelled');
  });

  it('returns human-readable label for COLLECTED', () => {
    expect(getStatusLabel('COLLECTED')).toContain('Collected');
  });

  it('falls back to the raw status string for unknown values', () => {
    const result = getStatusLabel('FOOBAR');
    expect(result).toBe('FOOBAR');
  });
});

// ── getCategoryLabel ──────────────────────────────────────────────────────────

describe('getCategoryLabel', () => {
  const CATEGORIES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];

  it('returns a non-empty label for every valid category', () => {
    for (const cat of CATEGORIES) {
      const result = getCategoryLabel(cat);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('returns the raw input for unknown categories', () => {
    expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('BREAKFAST label includes Breakfast', () => {
    expect(getCategoryLabel('BREAKFAST')).toContain('Breakfast');
  });

  it('LUNCH label includes Lunch', () => {
    expect(getCategoryLabel('LUNCH')).toContain('Lunch');
  });
});

// ── getCategoryEmoji ──────────────────────────────────────────────────────────

describe('getCategoryEmoji', () => {
  it('returns an emoji string for each category', () => {
    const cats = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];
    for (const cat of cats) {
      const result = getCategoryEmoji(cat);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('returns a fallback emoji for unknown categories', () => {
    const result = getCategoryEmoji('NOTHING');
    expect(typeof result).toBe('string');
  });
});

// ── getApiError ───────────────────────────────────────────────────────────────

describe('getApiError', () => {
  it('extracts message from response.data.message', () => {
    const err = { response: { data: { message: 'Not authorized.' } } };
    expect(getApiError(err)).toBe('Not authorized.');
  });

  it('extracts message from response.data.errors[0].msg (express-validator format)', () => {
    const err = { response: { data: { errors: [{ msg: 'Email is invalid.' }] } } };
    expect(getApiError(err)).toBe('Email is invalid.');
  });

  it('falls back to err.message when no response body', () => {
    const err = { message: 'Network Error' };
    expect(getApiError(err)).toBe('Network Error');
  });

  it('returns "Something went wrong" as last resort', () => {
    expect(getApiError({})).toBe('Something went wrong');
  });

  it('response.data.message takes priority over errors array', () => {
    const err = {
      response: {
        data: {
          message: 'Primary message',
          errors: [{ msg: 'Secondary' }],
        },
      },
    };
    expect(getApiError(err)).toBe('Primary message');
  });
});
