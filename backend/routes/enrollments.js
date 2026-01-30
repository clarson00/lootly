const express = require('express');
const router = express.Router();
const { db, generateId } = require('../db/database');
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// POST /api/enrollments - Enroll in a loyalty program
router.post('/', (req, res) => {
  const { business_id } = req.body;
  const customerId = req.customer.id;

  if (!business_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
    });
  }

  // Check if business exists
  const business = db.prepare('SELECT id FROM businesses WHERE id = ?').get(business_id);
  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found' }
    });
  }

  // Check if already enrolled
  const existing = db.prepare(`
    SELECT id FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customerId, business_id);

  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_ENROLLED', message: 'Already enrolled in this program' }
    });
  }

  // Create enrollment
  const enrollmentId = generateId('enroll');
  db.prepare(`
    INSERT INTO enrollments (id, customer_id, business_id)
    VALUES (?, ?, ?)
  `).run(enrollmentId, customerId, business_id);

  const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollmentId);

  res.status(201).json({
    success: true,
    data: {
      enrollment: {
        id: enrollment.id,
        business_id: enrollment.business_id,
        points_balance: enrollment.points_balance,
        total_points_earned: enrollment.total_points_earned,
        total_spend: enrollment.total_spend,
        points_multiplier: enrollment.points_multiplier
      }
    }
  });
});

// GET /api/enrollments - List all enrollments for customer
router.get('/', (req, res) => {
  const customerId = req.customer.id;

  const enrollments = db.prepare(`
    SELECT
      e.id,
      e.business_id,
      e.points_balance,
      e.total_points_earned,
      e.total_spend,
      e.points_multiplier,
      b.name as business_name,
      b.logo_url as business_logo,
      b.primary_color as business_color
    FROM enrollments e
    JOIN businesses b ON e.business_id = b.id
    WHERE e.customer_id = ?
  `).all(customerId);

  // Get locations visited for each enrollment
  const result = enrollments.map(enrollment => {
    const locationsVisited = db.prepare(`
      SELECT DISTINCT l.id, l.name, l.icon
      FROM visits v
      JOIN locations l ON v.location_id = l.id
      WHERE v.customer_id = ? AND l.business_id = ?
    `).all(customerId, enrollment.business_id);

    const totalLocations = db.prepare(`
      SELECT COUNT(*) as count FROM locations
      WHERE business_id = ? AND is_active = 1
    `).get(enrollment.business_id);

    return {
      ...enrollment,
      locations_visited: locationsVisited,
      total_locations: totalLocations.count
    };
  });

  res.json({
    success: true,
    data: {
      enrollments: result
    }
  });
});

// GET /api/enrollments/:business_id - Get enrollment details for a specific business
router.get('/:business_id', (req, res) => {
  const { business_id } = req.params;
  const customerId = req.customer.id;

  const enrollment = db.prepare(`
    SELECT
      e.*,
      b.name as business_name,
      b.logo_url as business_logo,
      b.primary_color as business_color
    FROM enrollments e
    JOIN businesses b ON e.business_id = b.id
    WHERE e.customer_id = ? AND e.business_id = ?
  `).get(customerId, business_id);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
    });
  }

  // Get all locations
  const locations = db.prepare(`
    SELECT id, name, icon, address
    FROM locations
    WHERE business_id = ? AND is_active = 1
  `).all(business_id);

  // Get visits
  const visits = db.prepare(`
    SELECT v.*, l.name as location_name, l.icon as location_icon
    FROM visits v
    JOIN locations l ON v.location_id = l.id
    WHERE v.customer_id = ? AND l.business_id = ?
    ORDER BY v.created_at DESC
    LIMIT 20
  `).all(customerId, business_id);

  // Get unlocked rewards
  const rewards = db.prepare(`
    SELECT cr.*, r.name, r.description, r.icon, r.points_cost, r.dollar_value, r.reward_type
    FROM customer_rewards cr
    JOIN rewards r ON cr.reward_id = r.id
    WHERE cr.customer_id = ? AND r.business_id = ?
    ORDER BY cr.unlocked_at DESC
  `).all(customerId, business_id);

  // Get visited location IDs
  const visitedLocationIds = new Set(visits.map(v => v.location_id));

  res.json({
    success: true,
    data: {
      enrollment: {
        id: enrollment.id,
        business_id: enrollment.business_id,
        business_name: enrollment.business_name,
        business_logo: enrollment.business_logo,
        business_color: enrollment.business_color,
        points_balance: enrollment.points_balance,
        total_points_earned: enrollment.total_points_earned,
        total_spend: enrollment.total_spend,
        points_multiplier: enrollment.points_multiplier
      },
      locations: locations.map(loc => ({
        ...loc,
        visited: visitedLocationIds.has(loc.id)
      })),
      visits,
      rewards
    }
  });
});

module.exports = router;
