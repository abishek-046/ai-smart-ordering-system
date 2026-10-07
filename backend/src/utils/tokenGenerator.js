const crypto = require('crypto');

/**
 * generateOrderToken — creates a cryptographically unique order identifier.
 *
 * Format:  ORD-{MMDD}-{8 lowercase hex characters}
 * Example: ORD-1015-a3f8c2d1
 *
 * Design decisions:
 *  - MMDD prefix lets canteen staff visually identify same-day orders at a glance.
 *  - 8 hex chars = crypto.randomBytes(4) = 4,294,967,296 combinations per day.
 *    This eliminates the IDOR enumeration risk of the old 4-digit format
 *    (which only had ~9,000 combinations, trivially brute-forceable).
 *  - crypto.randomBytes() uses the OS CSPRNG (cryptographically secure
 *    pseudo-random number generator) — not Math.random().
 *
 * Note: token uniqueness within the DB is enforced server-side by the
 * order.controller.js transaction (up to 10 attempts before failing).
 * The DB also has a unique index on Order.token as a safety net.
 */
const generateOrderToken = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const hex   = crypto.randomBytes(4).toString('hex'); // 8 hex chars = 4 billion combinations
  return `ORD-${month}${day}-${hex}`;
};

module.exports = { generateOrderToken };
