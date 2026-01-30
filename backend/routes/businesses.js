const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/businesses - List all businesses
router.get('/', (req, res) => {
  const businesses = db.prepare(`
    SELECT id, name, logo_url, primary_color
    FROM businesses
  `).all();

  res.json({
    success: true,
    data: {
      businesses
    }
  });
});

// GET /api/businesses/:id - Get business details
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const business = db.prepare(`
    SELECT id, name, logo_url, primary_color
    FROM businesses WHERE id = ?
  `).get(id);

  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Business not found' }
    });
  }

  const locations = db.prepare(`
    SELECT id, name, icon, address, is_active
    FROM locations
    WHERE business_id = ? AND is_active = 1
  `).all(id);

  res.json({
    success: true,
    data: {
      business,
      locations
    }
  });
});

// GET /api/businesses/:id/locations - Get business locations
router.get('/:id/locations', (req, res) => {
  const { id } = req.params;

  const business = db.prepare('SELECT id FROM businesses WHERE id = ?').get(id);

  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Business not found' }
    });
  }

  const locations = db.prepare(`
    SELECT id, name, icon, address, is_active
    FROM locations
    WHERE business_id = ? AND is_active = 1
  `).all(id);

  res.json({
    success: true,
    data: {
      locations
    }
  });
});

module.exports = router;
