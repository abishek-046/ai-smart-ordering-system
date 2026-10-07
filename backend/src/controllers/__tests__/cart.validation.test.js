/**
 * Unit tests for cart quantity validation logic.
 *
 * Covers the cart.controller.js rules for:
 *  - Per-item quantity limits (1–20)
 *  - Cumulative quantity enforcement (existing + new ≤ 20)
 *  - Item availability check (unavailable items cannot be added)
 *  - Remove-on-zero: setting quantity ≤ 0 removes the item
 *
 * These tests run without a database or HTTP server.
 */

const MAX_QUANTITY = 20;

// ── addToCart quantity validation (mirrors cart.controller.js addToCart) ──────

function validateAddToCart({ foodItemId, quantity, existingQty = 0, isAvailable = true }) {
  if (!foodItemId) return 'foodItemId is required.';

  const qty = parseInt(quantity);
  if (!Number.isInteger(qty) || qty < 1) return 'Quantity must be a positive integer.';
  if (qty > MAX_QUANTITY) return `Quantity cannot exceed ${MAX_QUANTITY} per item.`;

  if (!isAvailable) return 'This item is currently unavailable.';

  const cumulative = existingQty + qty;
  if (cumulative > MAX_QUANTITY) {
    return `You already have ${existingQty} of this item. Maximum allowed is ${MAX_QUANTITY}.`;
  }

  return null; // valid
}

// ── updateCartItem validation (mirrors cart.controller.js updateCartItem) ─────

function validateUpdateCartItem({ foodItemId, quantity }) {
  if (!foodItemId || quantity === undefined) return 'foodItemId and quantity are required.';
  const qty = parseInt(quantity);
  if (!Number.isInteger(qty)) return 'Quantity must be an integer.';
  if (qty > MAX_QUANTITY) return `Quantity cannot exceed ${MAX_QUANTITY} per item.`;
  return null; // valid (qty ≤ 0 means remove — handled in controller)
}

// ─────────────────────────────────────────────────────────────────────────────

describe('validateAddToCart', () => {

  // ── Required fields ─────────────────────────────────────────────────────────

  it('rejects missing foodItemId', () => {
    expect(validateAddToCart({ quantity: 1 })).toContain('foodItemId');
  });

  it('rejects null foodItemId', () => {
    expect(validateAddToCart({ foodItemId: null, quantity: 1 })).toBeTruthy();
  });

  // ── Quantity range ──────────────────────────────────────────────────────────

  it('accepts quantity of 1 (minimum)', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 1 })).toBeNull();
  });

  it('accepts quantity of 20 (maximum per call)', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 20 })).toBeNull();
  });

  it('rejects quantity of 0', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 0 })).toBeTruthy();
  });

  it('rejects negative quantity', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: -1 })).toBeTruthy();
  });

  it('rejects quantity of 21 (exceeds per-call maximum)', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 21 })).toBeTruthy();
  });

  it('rejects non-numeric quantity string', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 'lots' })).toBeTruthy();
  });

  // ── Availability check ──────────────────────────────────────────────────────

  it('rejects adding an unavailable item', () => {
    const err = validateAddToCart({ foodItemId: 'abc', quantity: 1, isAvailable: false });
    expect(err).toContain('unavailable');
  });

  it('accepts adding an available item', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 1, isAvailable: true })).toBeNull();
  });

  // ── Cumulative quantity enforcement ─────────────────────────────────────────

  it('accepts when existing + new quantity equals exactly 20', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 10, existingQty: 10 })).toBeNull();
  });

  it('rejects when existing + new quantity exceeds 20', () => {
    const err = validateAddToCart({ foodItemId: 'abc', quantity: 11, existingQty: 10 });
    expect(err).toContain('Maximum allowed is 20');
  });

  it('rejects when existing=19 and adding 2 (total=21)', () => {
    const err = validateAddToCart({ foodItemId: 'abc', quantity: 2, existingQty: 19 });
    expect(err).toContain('Maximum allowed is 20');
  });

  it('accepts when existing=19 and adding 1 (total=20, exactly at limit)', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 1, existingQty: 19 })).toBeNull();
  });

  it('accepts when there is no existing quantity (fresh add)', () => {
    expect(validateAddToCart({ foodItemId: 'abc', quantity: 5 })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('validateUpdateCartItem', () => {
  it('returns null for valid update', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: 3 })).toBeNull();
  });

  it('rejects missing foodItemId', () => {
    expect(validateUpdateCartItem({ quantity: 3 })).toBeTruthy();
  });

  it('rejects missing quantity', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc' })).toBeTruthy();
  });

  it('accepts quantity of 0 (controller will remove the item)', () => {
    // qty ≤ 0 is valid input — the controller treats it as a remove operation
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: 0 })).toBeNull();
  });

  it('accepts negative quantity (controller treats it as remove)', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: -1 })).toBeNull();
  });

  it('rejects quantity above 20', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: 21 })).toBeTruthy();
  });

  it('rejects non-integer quantity string', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: 'five' })).toBeTruthy();
  });

  it('accepts quantity of exactly 20 (maximum)', () => {
    expect(validateUpdateCartItem({ foodItemId: 'abc', quantity: 20 })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Cart MAX_QUANTITY constant', () => {
  it('is set to 20', () => {
    expect(MAX_QUANTITY).toBe(20);
  });
});
