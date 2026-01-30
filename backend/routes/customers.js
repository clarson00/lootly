const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { authenticateCustomer } = require('../middleware/auth');

const { customers, qrCodes } = schema;

// All routes require customer authentication
router.use(authenticateCustomer);

// PATCH /api/customers/profile - Update customer profile
router.patch('/profile', async (req, res) => {
  const { name, email } = req.body;
  const customerId = req.customer.id;

  try {
    // Build update object dynamically
    const updates = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (email !== undefined) {
      // Basic email validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_EMAIL', message: 'Invalid email format' }
        });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_UPDATES', message: 'No fields to update' }
      });
    }

    updates.updatedAt = new Date();

    await db.update(customers).set(updates).where(eq(customers.id, customerId));

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));

    // Get primary QR code
    const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.customerId, customerId));

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
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update profile' }
    });
  }
});

// GET /api/customers/qr-code - Get customer QR code
router.get('/qr-code', async (req, res) => {
  const customerId = req.customer.id;

  try {
    // Get or create QR code
    let [qr] = await db.select().from(qrCodes).where(eq(qrCodes.customerId, customerId));

    const qrCodeValue = qr?.code || `lootly:customer:${customerId}`;

    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(qrCodeValue, {
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
        qr_code: qrCodeValue,
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
