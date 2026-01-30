const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db } = require('../db/database');
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// PATCH /api/customers/profile - Update customer profile
router.patch('/profile', (req, res) => {
  const { name, email } = req.body;
  const customerId = req.customer.id;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }

  if (email !== undefined) {
    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Invalid email format' }
      });
    }
    updates.push('email = ?');
    values.push(email);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_UPDATES', message: 'No fields to update' }
    });
  }

  values.push(customerId);

  db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

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

// GET /api/customers/qr-code - Get customer QR code
router.get('/qr-code', async (req, res) => {
  const customerId = req.customer.id;

  const customer = db.prepare('SELECT qr_code FROM customers WHERE id = ?').get(customerId);

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Customer not found' }
    });
  }

  try {
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(customer.qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      data: {
        qr_code: customer.qr_code,
        qr_data_url: qrDataUrl
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: { code: 'QR_ERROR', message: 'Failed to generate QR code' }
    });
  }
});

module.exports = router;
