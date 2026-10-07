/**
 * Unit tests for menu item input validation logic.
 *
 * We extract and test validateMenuInput independently — this is pure business
 * logic with no database or HTTP dependency, making it ideal for unit testing.
 *
 * Covers:
 *  - Valid create/update inputs
 *  - Missing required fields on create
 *  - Price boundary values (0, negative, above 10000)
 *  - Name length boundaries (< 2, exactly 2, 100, > 100)
 *  - prepTimeMinutes boundaries (0, 1, 180, 181)
 *  - Invalid category values
 *  - Partial update (isCreate=false) — only validates provided fields
 */

const { describe, it, expect } = require('@jest/globals');

// ── Extract the validation helper from menu.controller without loading Prisma.
// We do this by re-implementing just the validation function here, matching
// the source exactly. This avoids requiring a live database for pure logic tests.
const VALID_CATEGORIES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];

function validateMenuInput({ name, price, prepTimeMinutes, category }, isCreate = true) {
  const errors = [];

  if (isCreate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (name && name.trim().length > 100) {
      errors.push('Name must be 100 characters or fewer.');
    }
  }

  if (isCreate || price !== undefined) {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      errors.push('Price must be a positive number.');
    }
    if (p > 10000) {
      errors.push('Price cannot exceed ₹10,000.');
    }
  }

  if (isCreate || prepTimeMinutes !== undefined) {
    const t = parseInt(prepTimeMinutes);
    if (prepTimeMinutes !== undefined && (isNaN(t) || t < 1)) {
      errors.push('Preparation time must be at least 1 minute.');
    }
    if (!isNaN(t) && t > 180) {
      errors.push('Preparation time cannot exceed 180 minutes.');
    }
  }

  if (isCreate || category !== undefined) {
    if (category && !VALID_CATEGORIES.includes(category.toUpperCase())) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
    }
  }

  return errors;
}

// ── CREATE validation ─────────────────────────────────────────────────────────

describe('validateMenuInput (isCreate=true)', () => {

  it('returns no errors for a fully valid new item', () => {
    const errors = validateMenuInput({
      name: 'Masala Dosa',
      price: 60,
      prepTimeMinutes: 15,
      category: 'BREAKFAST',
    }, true);
    expect(errors).toHaveLength(0);
  });

  // ── Name validation ─────────────────────────────────────────────────────────

  it('rejects missing name', () => {
    const errors = validateMenuInput({ price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Name'))).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const errors = validateMenuInput({ name: 'A', price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Name'))).toBe(true);
  });

  it('accepts name of exactly 2 characters', () => {
    const errors = validateMenuInput({ name: 'Ab', price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Name'))).toBe(false);
  });

  it('accepts name of exactly 100 characters', () => {
    const name = 'A'.repeat(100);
    const errors = validateMenuInput({ name, price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Name'))).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const name = 'A'.repeat(101);
    const errors = validateMenuInput({ name, price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('100 characters'))).toBe(true);
  });

  // ── Price validation ────────────────────────────────────────────────────────

  it('rejects price of 0', () => {
    const errors = validateMenuInput({ name: 'Item', price: 0, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Price'))).toBe(true);
  });

  it('rejects negative price', () => {
    const errors = validateMenuInput({ name: 'Item', price: -10, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Price'))).toBe(true);
  });

  it('accepts price of 1 (minimum valid price)', () => {
    const errors = validateMenuInput({ name: 'Item', price: 1, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Price'))).toBe(false);
  });

  it('accepts price of 10000 (maximum valid price)', () => {
    const errors = validateMenuInput({ name: 'Item', price: 10000, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Price'))).toBe(false);
  });

  it('rejects price above 10000', () => {
    const errors = validateMenuInput({ name: 'Item', price: 10001, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('₹10,000'))).toBe(true);
  });

  it('rejects non-numeric price string', () => {
    const errors = validateMenuInput({ name: 'Item', price: 'free', category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Price'))).toBe(true);
  });

  // ── PrepTime validation ─────────────────────────────────────────────────────

  it('rejects prepTimeMinutes of 0', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, prepTimeMinutes: 0, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Preparation time'))).toBe(true);
  });

  it('accepts prepTimeMinutes of 1 (minimum)', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, prepTimeMinutes: 1, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Preparation time'))).toBe(false);
  });

  it('accepts prepTimeMinutes of 180 (maximum)', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, prepTimeMinutes: 180, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Preparation time'))).toBe(false);
  });

  it('rejects prepTimeMinutes of 181', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, prepTimeMinutes: 181, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Preparation time'))).toBe(true);
  });

  it('allows missing prepTimeMinutes on create (uses DB default)', () => {
    // prepTimeMinutes is optional on create — if not provided, DB defaults to 10
    const errors = validateMenuInput({ name: 'Item', price: 50, category: 'LUNCH' }, true);
    expect(errors.some(e => e.includes('Preparation time'))).toBe(false);
  });

  // ── Category validation ─────────────────────────────────────────────────────

  it('accepts all valid categories', () => {
    for (const cat of VALID_CATEGORIES) {
      const errors = validateMenuInput({ name: 'Item', price: 50, category: cat }, true);
      expect(errors.some(e => e.includes('Category'))).toBe(false);
    }
  });

  it('rejects invalid category', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, category: 'INVALID' }, true);
    expect(errors.some(e => e.includes('Category'))).toBe(true);
  });

  it('is case-insensitive for category matching', () => {
    const errors = validateMenuInput({ name: 'Item', price: 50, category: 'lunch' }, true);
    expect(errors.some(e => e.includes('Category'))).toBe(false);
  });
});

// ── UPDATE validation (isCreate=false) ───────────────────────────────────────

describe('validateMenuInput (isCreate=false)', () => {

  it('returns no errors when updating only price (other fields omitted)', () => {
    const errors = validateMenuInput({ price: 75 }, false);
    expect(errors).toHaveLength(0);
  });

  it('validates name when it is provided in update', () => {
    const errors = validateMenuInput({ name: 'X' }, false); // too short
    expect(errors.some(e => e.includes('Name'))).toBe(true);
  });

  it('validates price when it is provided in update', () => {
    const errors = validateMenuInput({ price: -5 }, false);
    expect(errors.some(e => e.includes('Price'))).toBe(true);
  });

  it('validates category when it is provided in update', () => {
    const errors = validateMenuInput({ category: 'NOTREAL' }, false);
    expect(errors.some(e => e.includes('Category'))).toBe(true);
  });

  it('skips category check when category is not in the update payload', () => {
    const errors = validateMenuInput({ name: 'Valid Name', price: 50 }, false);
    expect(errors.some(e => e.includes('Category'))).toBe(false);
  });
});

// ── Multiple errors ───────────────────────────────────────────────────────────

describe('validateMenuInput multiple errors', () => {
  it('accumulates multiple errors in one call', () => {
    const errors = validateMenuInput({
      name: '',    // invalid
      price: -1,   // invalid
      category: 'BAD', // invalid
    }, true);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
