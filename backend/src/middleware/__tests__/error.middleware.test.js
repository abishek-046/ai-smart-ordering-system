/**
 * Unit tests for error-handling middleware.
 *
 * Covers:
 *  - notFound: sets 404 and calls next(error)
 *  - errorHandler: Prisma P2002 (duplicate) → 409
 *  - errorHandler: Prisma P2025 (not found) → 404
 *  - errorHandler: explicit statusCode on error object
 *  - errorHandler: fallback to 500 for unknown errors
 *  - errorHandler: always includes success:false
 *  - errorHandler: does not leak stack in production
 */

// Note: describe/it/expect/jest are Jest globals — no import needed.
const { notFound, errorHandler } = require('../error.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

// ── notFound ──────────────────────────────────────────────────────────────────

describe('notFound middleware', () => {
  it('calls next with an error having statusCode 404', () => {
    const req  = { originalUrl: '/api/nonexistent' };
    const res  = mockRes();
    const next = jest.fn();
    notFound(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(404);
  });

  it('includes the requested path in the error message', () => {
    const req  = { originalUrl: '/api/missing-route' };
    const next = jest.fn();
    notFound(req, mockRes(), next);
    const err = next.mock.calls[0][0];
    expect(err.message).toContain('/api/missing-route');
  });
});

// ── errorHandler ──────────────────────────────────────────────────────────────

describe('errorHandler middleware', () => {
  it('returns 409 for Prisma P2002 (unique constraint violation)', () => {
    const err = { code: 'P2002', meta: { target: ['email'] }, message: 'Unique constraint' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.field).toEqual(['email']);
  });

  it('returns 404 for Prisma P2025 (record not found)', () => {
    const err = { code: 'P2025', message: 'Record not found' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  it('uses err.statusCode when explicitly set', () => {
    const err = { statusCode: 422, message: 'Unprocessable' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('uses err.status as fallback when statusCode not set', () => {
    const err = { status: 400, message: 'Bad request' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('defaults to 500 for errors with no status code', () => {
    const err = new Error('Something exploded');
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('always includes success:false in response body', () => {
    const err = new Error('test');
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  it('does not expose stack trace in production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('secret'), { statusCode: 500 });
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    const body = res.json.mock.calls[0][0];
    expect(body.stack).toBeUndefined();
    process.env.NODE_ENV = original;
  });
});
