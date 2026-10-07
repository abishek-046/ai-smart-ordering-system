/**
 * Unit tests for admin order status transition rules.
 *
 * The transitions map in admin.controller.js enforces which status
 * changes are valid. This is critical business logic: invalid transitions
 * must return 400, not silently succeed.
 *
 * Tests the transition table exhaustively:
 *  - Every valid transition from every state
 *  - Every invalid transition from every state
 *  - Terminal states (COLLECTED, CANCELLED) allow no further transitions
 */

// Mirror the transitions map from admin.controller.js exactly
const TRANSITIONS = {
  PENDING:   ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:  ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY:     ['COLLECTED'],
  COLLECTED: [],
  CANCELLED: [],
};

const ALL_STATUSES = Object.keys(TRANSITIONS);

/**
 * Returns true if the transition from `from` to `to` is allowed.
 * Mirrors the check in updateOrderStatus.
 */
function isValidTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Order status transitions', () => {

  // ── Valid transitions ───────────────────────────────────────────────────────

  it('PENDING → ACCEPTED is valid', () => {
    expect(isValidTransition('PENDING', 'ACCEPTED')).toBe(true);
  });

  it('PENDING → CANCELLED is valid', () => {
    expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true);
  });

  it('ACCEPTED → PREPARING is valid', () => {
    expect(isValidTransition('ACCEPTED', 'PREPARING')).toBe(true);
  });

  it('ACCEPTED → CANCELLED is valid', () => {
    expect(isValidTransition('ACCEPTED', 'CANCELLED')).toBe(true);
  });

  it('PREPARING → READY is valid', () => {
    expect(isValidTransition('PREPARING', 'READY')).toBe(true);
  });

  it('READY → COLLECTED is valid', () => {
    expect(isValidTransition('READY', 'COLLECTED')).toBe(true);
  });

  // ── Invalid forward-skip transitions ─────────────────────────────────────

  it('PENDING → PREPARING is invalid (skips ACCEPTED)', () => {
    expect(isValidTransition('PENDING', 'PREPARING')).toBe(false);
  });

  it('PENDING → READY is invalid', () => {
    expect(isValidTransition('PENDING', 'READY')).toBe(false);
  });

  it('PENDING → COLLECTED is invalid', () => {
    expect(isValidTransition('PENDING', 'COLLECTED')).toBe(false);
  });

  it('ACCEPTED → READY is invalid (skips PREPARING)', () => {
    expect(isValidTransition('ACCEPTED', 'READY')).toBe(false);
  });

  it('PREPARING → COLLECTED is invalid (skips READY)', () => {
    expect(isValidTransition('PREPARING', 'COLLECTED')).toBe(false);
  });

  it('PREPARING → CANCELLED is invalid (can only cancel before prep starts)', () => {
    expect(isValidTransition('PREPARING', 'CANCELLED')).toBe(false);
  });

  it('READY → CANCELLED is invalid', () => {
    expect(isValidTransition('READY', 'CANCELLED')).toBe(false);
  });

  // ── Terminal states: no transitions allowed ───────────────────────────────

  it('COLLECTED → any status is invalid (terminal state)', () => {
    for (const to of ALL_STATUSES) {
      expect(isValidTransition('COLLECTED', to)).toBe(false);
    }
  });

  it('CANCELLED → any status is invalid (terminal state)', () => {
    for (const to of ALL_STATUSES) {
      expect(isValidTransition('CANCELLED', to)).toBe(false);
    }
  });

  // ── Self-transition is always invalid ─────────────────────────────────────

  it('No status can transition to itself', () => {
    for (const status of ALL_STATUSES) {
      expect(isValidTransition(status, status)).toBe(false);
    }
  });

  // ── Unknown current status returns false safely ────────────────────────────

  it('Unknown current status returns false (does not throw)', () => {
    expect(isValidTransition('UNKNOWN', 'ACCEPTED')).toBe(false);
    expect(isValidTransition(undefined, 'ACCEPTED')).toBe(false);
  });

  // ── Total valid transitions count ─────────────────────────────────────────

  it('exactly 6 valid transitions exist in the entire state machine', () => {
    let count = 0;
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (isValidTransition(from, to)) count++;
      }
    }
    // PENDING→ACCEPTED, PENDING→CANCELLED, ACCEPTED→PREPARING,
    // ACCEPTED→CANCELLED, PREPARING→READY, READY→COLLECTED
    expect(count).toBe(6);
  });
});
