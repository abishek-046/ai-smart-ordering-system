/**
 * Generates a unique human-readable order token.
 * Format: ORD-{DATE}-{RANDOM4DIGITS}
 * Example: ORD-0915-7423
 */
const generateOrderToken = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `ORD-${month}${day}-${rand}`;
};

module.exports = { generateOrderToken };
