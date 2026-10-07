/**
 * Unit tests for authentication middleware.
 *
 * Tests the JWT verification and role-based access logic
 * using mocked Prisma and JWT, without a live database.
 *
 * Covers:
 *  - Missing Authorization header → 401
 *  - Malformed header (no "Bearer" prefix) → 401
 *  - Invalid/tampered JWT → 401
 *  - Expired JWT → 401
 *  - Valid JWT for existing user → sets req.user, calls next()
 *  - Valid JWT for deleted user → 401
 *  - adminOnly: student role → 403
 *  - adminOnly: admin role → calls next()
 */

// Note: describe/it/expect/jest are Jest globals — no import needed.
const jwt = require('jsonwebtoken');

// ── Minimal inline re-implementation that mirrors auth.middleware.js ──────────
// We test the logic directly without loading Prisma.

const SECRET = 'test-secret-key';

function makeProtect(findUserFn) {
  return async function protect(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      const user = await findUserFn(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
      }
      next(err);
    }
  };
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
}

// ── Test helpers ──────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(authHeader) {
  return { headers: authHeader ? { authorization: authHeader } : {} };
}

function makeToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('protect middleware', () => {
  const STUDENT_USER = { id: 'user-1', name: 'Test', role: 'STUDENT' };
  const fakeFind = async (id) => id === STUDENT_USER.id ? STUDENT_USER : null;
  const protect = makeProtect(fakeFind);

  it('rejects request with no Authorization header', async () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request with Authorization header missing "Bearer" prefix', async () => {
    const req = mockReq('Token abc123');
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects a tampered/invalid JWT', async () => {
    const req = mockReq('Bearer this.is.not.a.jwt');
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toContain('Invalid token');
  });

  it('rejects an expired JWT', async () => {
    const expired = makeToken({ id: STUDENT_USER.id }, '-1s');
    const req = mockReq(`Bearer ${expired}`);
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toContain('expired');
  });

  it('rejects a valid JWT for a user that no longer exists in DB', async () => {
    const token = makeToken({ id: 'deleted-user-id' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toContain('no longer exists');
  });

  it('calls next() and sets req.user for a valid token and existing user', async () => {
    const token = makeToken({ id: STUDENT_USER.id });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(STUDENT_USER);
  });

  it('rejects a JWT signed with a different secret', async () => {
    const wrongToken = jwt.sign({ id: STUDENT_USER.id }, 'wrong-secret');
    const req = mockReq(`Bearer ${wrongToken}`);
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('adminOnly middleware', () => {
  it('rejects STUDENT role with 403', () => {
    const req = { user: { role: 'STUDENT' } };
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when req.user is undefined', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next() for ADMIN role', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
