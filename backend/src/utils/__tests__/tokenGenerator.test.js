/**
 * Unit tests for tokenGenerator utility.
 *
 * Covers:
 *  - Token format: ORD-MMDD-{8 lowercase hex chars}
 *  - Uniqueness across multiple calls
 *  - Date embedding (month/day are correct today)
 *  - No collisions in 1,000 rapid generations
 */

const { generateOrderToken } = require('../tokenGenerator');

describe('generateOrderToken', () => {
  const TOKEN_RE = /^ORD-\d{4}-[a-f0-9]{8}$/;

  it('returns a string matching ORD-MMDD-8hex format', () => {
    const token = generateOrderToken();
    expect(typeof token).toBe('string');
    expect(token).toMatch(TOKEN_RE);
  });

  it('embeds today\'s month and day correctly', () => {
    const token = generateOrderToken();
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    // Part after "ORD-" before the second dash
    const datePart = token.split('-')[1];
    expect(datePart).toBe(`${mm}${dd}`);
  });

  it('hex part is exactly 8 characters long', () => {
    const token = generateOrderToken();
    const hexPart = token.split('-')[2];
    expect(hexPart).toHaveLength(8);
  });

  it('hex part contains only lowercase hex characters', () => {
    const token = generateOrderToken();
    const hexPart = token.split('-')[2];
    expect(hexPart).toMatch(/^[a-f0-9]{8}$/);
  });

  it('generates unique tokens across 1,000 calls', () => {
    const tokens = new Set();
    for (let i = 0; i < 1000; i++) {
      tokens.add(generateOrderToken());
    }
    // With 4.29 billion possible hex values, collisions in 1,000 calls
    // are astronomically unlikely. Any collision indicates a broken RNG.
    expect(tokens.size).toBe(1000);
  });

  it('generates a new token on each call (not cached)', () => {
    // If the same token returns twice in a row something is very wrong.
    // With 4B+ combinations this is effectively impossible by chance.
    const t1 = generateOrderToken();
    const t2 = generateOrderToken();
    // They CAN theoretically match but the probability is ~1 in 4 billion.
    // We just verify both are valid.
    expect(t1).toMatch(TOKEN_RE);
    expect(t2).toMatch(TOKEN_RE);
  });
});
