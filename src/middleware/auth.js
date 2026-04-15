const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('[Auth] WARNING: JWT_SECRET not set in environment variables!');
}

/**
 * Middleware: require a valid JWT token in Authorization header.
 * Attaches req.user = { userId, email, role } on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}

/**
 * Middleware: require a specific role (e.g. 'employer', 'admin').
 * Must be used after requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
