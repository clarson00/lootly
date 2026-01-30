const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lootly-dev-secret';

// Verify customer JWT
function authenticateCustomer(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== 'customer') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Invalid token type' }
      });
    }

    req.customer = {
      id: decoded.customer_id,
      phone: decoded.phone
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}

// Verify staff JWT
function authenticateStaff(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== 'staff') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Invalid token type' }
      });
    }

    req.staff = {
      id: decoded.staff_id,
      location_id: decoded.location_id,
      business_id: decoded.business_id
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}

// Generate JWT token
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  authenticateCustomer,
  authenticateStaff,
  generateToken
};
