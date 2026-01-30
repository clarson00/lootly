const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../db');
const { eq } = require('drizzle-orm');
const { generateToken, authenticateCustomer } = require('../middleware/auth');

const { customers, enrollments, qrCodes } = schema;

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
router.post('/verify-code', async (req, res) => {
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

  try {
    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check if customer exists
    let [customer] = await db.select().from(customers).where(eq(customers.phone, normalizedPhone));
    let isNew = false;

    if (!customer) {
      // Create new customer
      isNew = true;
      const customerId = generateId('cust');
      const qrCode = `lootly:customer:${customerId}`;

      await db.insert(customers).values({
        id: customerId,
        phone: normalizedPhone
      });

      // Create QR code record
      await db.insert(qrCodes).values({
        id: generateId('qr'),
        customerId: customerId,
        code: qrCode,
        type: 'primary'
      });

      [customer] = await db.select().from(customers).where(eq(customers.id, customerId));

      // Auto-enroll in pilot business for MVP
      await db.insert(enrollments).values({
        id: generateId('enroll'),
        customerId: customerId,
        businessId: 'biz_pilot'
      });

      console.log(`[AUTH] New customer created: ${customerId}`);
    }

    // Get QR code
    const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.customerId, customer.id));

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
          qr_code: qr?.code || `lootly:customer:${customer.id}`
        },
        isNew
      }
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to verify code' }
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateCustomer, async (req, res) => {
  try {
    const [customer] = await db.select().from(customers).where(eq(customers.id, req.customer.id));

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Customer not found' }
      });
    }

    // Get QR code
    const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.customerId, customer.id));

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          email: customer.email,
          qr_code: qr?.code || `lootly:customer:${customer.id}`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch customer' }
    });
  }
});

module.exports = router;
