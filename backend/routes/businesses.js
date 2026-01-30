const express = require('express');
const router = express.Router();
const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');

const { businesses, locations } = schema;

// GET /api/businesses - List all businesses
router.get('/', async (req, res) => {
  try {
    const result = await db.select({
      id: businesses.id,
      name: businesses.name,
      logoUrl: businesses.logoUrl,
      primaryColor: businesses.primaryColor
    }).from(businesses);

    res.json({
      success: true,
      data: {
        businesses: result.map(b => ({
          id: b.id,
          name: b.name,
          logo_url: b.logoUrl,
          primary_color: b.primaryColor
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch businesses' }
    });
  }
});

// GET /api/businesses/:id - Get business details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [business] = await db.select({
      id: businesses.id,
      name: businesses.name,
      logoUrl: businesses.logoUrl,
      primaryColor: businesses.primaryColor
    }).from(businesses).where(eq(businesses.id, id));

    if (!business) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Business not found' }
      });
    }

    const locs = await db.select({
      id: locations.id,
      name: locations.name,
      icon: locations.icon,
      addressLine1: locations.addressLine1,
      isActive: locations.isActive
    }).from(locations).where(eq(locations.businessId, id));

    res.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          logo_url: business.logoUrl,
          primary_color: business.primaryColor
        },
        locations: locs.filter(l => l.isActive).map(l => ({
          id: l.id,
          name: l.name,
          icon: l.icon,
          address: l.addressLine1,
          is_active: l.isActive
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch business' }
    });
  }
});

// GET /api/businesses/:id/locations - Get business locations
router.get('/:id/locations', async (req, res) => {
  const { id } = req.params;

  try {
    const [business] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.id, id));

    if (!business) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Business not found' }
      });
    }

    const locs = await db.select({
      id: locations.id,
      name: locations.name,
      icon: locations.icon,
      addressLine1: locations.addressLine1,
      isActive: locations.isActive
    }).from(locations).where(eq(locations.businessId, id));

    res.json({
      success: true,
      data: {
        locations: locs.filter(l => l.isActive).map(l => ({
          id: l.id,
          name: l.name,
          icon: l.icon,
          address: l.addressLine1,
          is_active: l.isActive
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch locations' }
    });
  }
});

module.exports = router;
