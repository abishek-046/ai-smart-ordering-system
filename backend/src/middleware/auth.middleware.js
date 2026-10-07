const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * protect — JWT authentication middleware.
 *
 * Validates the Bearer token in the Authorization header, then fetches
 * the user from the database to confirm the account still exists.
 *
 * Attaches req.user = { id, name, email, role, studentId } on success.
 *
 * Why we re-fetch from DB on every request (not just decode the JWT):
 *  - Ensures a deleted or suspended account cannot continue making requests
 *    with a still-valid JWT (JWTs are stateless and cannot be invalidated
 *    without a blocklist; re-fetching the user is our mitigation).
 *  - The select is narrow (no password hash) to minimise data exposure.
 */

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, studentId: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
};

/**
 * adminOnly — role-based access control middleware.
 *
 * Must be used AFTER protect (depends on req.user being set).
 * Returns 403 Forbidden for any non-ADMIN role, including unauthenticated
 * requests where protect failed to set req.user.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
