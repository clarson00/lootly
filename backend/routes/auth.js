const express = require('express');
const router = express.Router();
const { db, generateId } = require('../db/database');
const { generateToken, authenticateCustomer } = require('../middleware/auth');

// POST /api/auth/request-code - Request SMS verification code
router.post('/request-code', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PHONE', message: 'Phone number is required' }
    });
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'Invalid phone number format' }
    });
  }

  // For MVP, we don't actually send SMS - just accept any code
  console.log(`[AUTH] Code requested for ${phone} (MVP: use code 1234)`);

  res.json({
    success: true,
    message: 'Code sent'
  });
});

// POST /api/auth/verify-code - Verify SMS code and get JWT
router.post('/verify-code', (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Phone and code are required' }
    });
  }

  // For MVP, accept code "1234" or any 4-digit code
  if (code !== '1234' && !/^\d{4}$/.test(code)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CODE', message: 'The verification code is incorrect' }
    });
  }

  // Normalize phone number
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if customer exists
  let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(normalizedPhone);
  let isNew = false;

  if (!customer) {
    // Create new customer
    isNew = true;
    const customerId = generateId('cust');
    const qrCode = `lootly:customer:${customerId}`;

    db.prepare(`
      INSERT INTO customers (id, phone, qr_code)
      VALUES (?, ?, ?)
    `).run(customerId, normalizedPhone, qrCode);

    customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

    // Auto-enroll in pilot business for MVP
    const enrollmentId = generateId('enroll');
    db.prepare(`
      INSERT INTO enrollments (id, customer_id, business_id)
      VALUES (?, ?, 'biz_pilot')
    `).run(enrollmentId, customerId);

    console.log(`[AUTH] New customer created: ${customerId}`);
  }

  // Generate token
  const token = generateToken({
    type: 'customer',
    customer_id: customer.id,
    phone: customer.phone
  });

  console.log(`[AUTH] Customer logged in: ${customer.id}`);

  res.json({
    success: true,
    data: {
      token,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        qr_code: customer.qr_code
      },
      isNew
    }
  });
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateCustomer, (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customer.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Customer not found' }
    });
  }

  res.json({
    success: true,
    data: {
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        qr_code: customer.qr_code
      }
    }
  });
});

module.exports = router;
