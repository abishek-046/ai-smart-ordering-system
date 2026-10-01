const crypto = require('crypto');

/**
 * Generates a unique, high-entropy order token.
 *
 * Format: ORD-{MMDD}-{8-char hex}
 * Example: ORD-0929-a3f2c8b1
 *
 * Entropy upgrade from previous 4-digit (9,000 values/day) to
 * 8-char hex (4,294,967,296 values) — eliminates IDOR enumeration risk.
 * Using crypto.randomBytes for cryptographically secure randomness.
 */
const generateOrderToken = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const hex   = crypto.randomBytes(4).toString('hex'); // 8 hex chars = 4 billion combinations
  return `ORD-${month}${day}-${hex}`;
};

module.exports = { generateOrderToken };
