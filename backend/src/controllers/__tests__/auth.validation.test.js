/**
 * Unit tests for authentication business logic.
 *
 * Tests password and profile update validation rules extracted from
 * auth.controller.js — pure logic with no DB or HTTP dependency.
 *
 * Covers:
 *  - changePassword: both fields required
 *  - changePassword: newPassword min 6 chars
 *  - changePassword: newPassword max 128 chars
 *  - updateProfile: name min 2, max 100
 *  - updateProfile: phone must be 10 digits when provided
 *  - updateProfile: empty phone is allowed (clears the field)
 *  - signToken: returns a JWT string containing the user id
 */

const jwt = require('jsonwebtoken');

// ── Password change validation (mirrors auth.controller.js changePassword) ────

function validatePasswordChange({ currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    return 'Both currentPassword and newPassword are required.';
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return 'New password must be at least 6 characters.';
  }
  if (newPassword.length > 128) {
    return 'New password is too long.';
  }
  return null; // valid
}

// ── Profile update validation (mirrors auth.controller.js updateProfile) ──────

function validateProfileUpdate({ name, phone }) {
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    if (name.trim().length > 100) {
      return 'Name must be 100 characters or fewer.';
    }
  }
  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim())) {
      return 'Phone must be a 10-digit number.';
    }
  }
  return null; // valid
}

// ── JWT signing (mirrors signToken in auth.controller.js) ─────────────────────

function signToken(userId, secret, expiresIn = '7d') {
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('validatePasswordChange', () => {
  it('returns null for valid current + new password', () => {
    expect(validatePasswordChange({ currentPassword: 'old123', newPassword: 'new456' })).toBeNull();
  });

  it('rejects when currentPassword is missing', () => {
    expect(validatePasswordChange({ newPassword: 'new456' })).toBeTruthy();
  });

  it('rejects when newPassword is missing', () => {
    expect(validatePasswordChange({ currentPassword: 'old123' })).toBeTruthy();
  });

  it('rejects when both are missing', () => {
    expect(validatePasswordChange({})).toBeTruthy();
  });

  it('rejects newPassword shorter than 6 characters', () => {
    const err = validatePasswordChange({ currentPassword: 'old123', newPassword: 'abc' });
    expect(err).toContain('6 characters');
  });

  it('accepts newPassword of exactly 6 characters', () => {
    expect(validatePasswordChange({ currentPassword: 'old123', newPassword: 'abc123' })).toBeNull();
  });

  it('accepts newPassword of exactly 128 characters', () => {
    const long = 'a'.repeat(128);
    expect(validatePasswordChange({ currentPassword: 'old123', newPassword: long })).toBeNull();
  });

  it('rejects newPassword longer than 128 characters', () => {
    const tooLong = 'a'.repeat(129);
    const err = validatePasswordChange({ currentPassword: 'old123', newPassword: tooLong });
    expect(err).toContain('too long');
  });

  it('rejects non-string newPassword', () => {
    expect(validatePasswordChange({ currentPassword: 'old', newPassword: 12345 })).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('validateProfileUpdate', () => {
  it('returns null when no fields are provided (all optional)', () => {
    expect(validateProfileUpdate({})).toBeNull();
  });

  it('accepts a valid name', () => {
    expect(validateProfileUpdate({ name: 'Abishek Kumar' })).toBeNull();
  });

  it('rejects name shorter than 2 characters', () => {
    const err = validateProfileUpdate({ name: 'A' });
    expect(err).toContain('2 characters');
  });

  it('accepts name of exactly 2 characters', () => {
    expect(validateProfileUpdate({ name: 'AB' })).toBeNull();
  });

  it('accepts name of exactly 100 characters', () => {
    expect(validateProfileUpdate({ name: 'A'.repeat(100) })).toBeNull();
  });

  it('rejects name longer than 100 characters', () => {
    const err = validateProfileUpdate({ name: 'A'.repeat(101) });
    expect(err).toContain('100 characters');
  });

  it('accepts valid 10-digit phone number', () => {
    expect(validateProfileUpdate({ phone: '9876543210' })).toBeNull();
  });

  it('rejects phone number with fewer than 10 digits', () => {
    const err = validateProfileUpdate({ phone: '987654' });
    expect(err).toContain('10-digit');
  });

  it('rejects phone number with more than 10 digits', () => {
    const err = validateProfileUpdate({ phone: '98765432101' });
    expect(err).toContain('10-digit');
  });

  it('rejects phone number with non-digit characters', () => {
    const err = validateProfileUpdate({ phone: '987654321A' });
    expect(err).toContain('10-digit');
  });

  it('accepts empty string phone (clears the field)', () => {
    expect(validateProfileUpdate({ phone: '' })).toBeNull();
  });

  it('accepts null phone (clears the field)', () => {
    expect(validateProfileUpdate({ phone: null })).toBeNull();
  });

  it('validates both name and phone in a single call', () => {
    const err = validateProfileUpdate({ name: 'A', phone: '123' });
    // Should return the name error (first checked)
    expect(err).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('signToken (JWT generation)', () => {
  const SECRET = 'test-signing-secret';

  it('returns a string', () => {
    const token = signToken('user-123', SECRET);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('JWT payload contains the user id', () => {
    const token = signToken('user-abc', SECRET);
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.id).toBe('user-abc');
  });

  it('JWT is verifiable with the same secret', () => {
    const token = signToken('user-xyz', SECRET);
    expect(() => jwt.verify(token, SECRET)).not.toThrow();
  });

  it('JWT is not verifiable with a different secret', () => {
    const token = signToken('user-xyz', SECRET);
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
  });

  it('JWT expires after the given duration', () => {
    const token = signToken('user-1', SECRET, '-1s'); // already expired
    expect(() => jwt.verify(token, SECRET)).toThrow(/expired/i);
  });
});
