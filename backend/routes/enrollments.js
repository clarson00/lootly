const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../db');
const { eq, and, desc, sql } = require('drizzle-orm');
const { authenticateCustomer } = require('../middleware/auth');

const { businesses, locations, enrollments, visits, customerRewards, rewards } = schema;

// All routes require customer authentication
router.use(authenticateCustomer);

// POST /api/enrollments - Enroll in a loyalty program
router.post('/', async (req, res) => {
  const { business_id } = req.body;
  const customerId = req.customer.id;

  if (!business_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
    });
  }

  try {
    // Check if business exists
    const [business] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.id, business_id));
    if (!business) {
      return res.status(404).json({
        success: false,
        error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found' }
      });
    }

    // Check if already enrolled
    const [existing] = await db.select({ id: enrollments.id }).from(enrollments)
      .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, business_id)));

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_ENROLLED', message: 'Already enrolled in this program' }
      });
    }

    // Create enrollment
    const enrollmentId = generateId('enroll');
    await db.insert(enrollments).values({
      id: enrollmentId,
      customerId: customerId,
      businessId: business_id
    });

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));

    res.status(201).json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          business_id: enrollment.businessId,
          points_balance: enrollment.pointsBalance,
          total_points_earned: enrollment.lifetimePoints,
          total_spend: enrollment.lifetimeSpend,
          points_multiplier: enrollment.pointsMultiplier
        }
      }
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create enrollment' }
    });
  }
});

// GET /api/enrollments - List all enrollments for customer
router.get('/', async (req, res) => {
  const customerId = req.customer.id;

  try {
    const enrollmentList = await db.select({
      id: enrollments.id,
      businessId: enrollments.businessId,
      pointsBalance: enrollments.pointsBalance,
      lifetimePoints: enrollments.lifetimePoints,
      lifetimeSpend: enrollments.lifetimeSpend,
      pointsMultiplier: enrollments.pointsMultiplier,
      businessName: businesses.name,
      businessLogo: businesses.logoUrl,
      businessColor: businesses.primaryColor
    })
    .from(enrollments)
    .innerJoin(businesses, eq(enrollments.businessId, businesses.id))
    .where(eq(enrollments.customerId, customerId));

    // Get locations visited for each enrollment
    const result = await Promise.all(enrollmentList.map(async (enrollment) => {
      // Get distinct visited locations
      const locationsVisited = await db.selectDistinct({
        id: locations.id,
        name: locations.name,
        icon: locations.icon
      })
      .from(visits)
      .innerJoin(locations, eq(visits.locationId, locations.id))
      .where(and(eq(visits.customerId, customerId), eq(locations.businessId, enrollment.businessId)));

      // Count total locations
      const [totalLocs] = await db.select({
        count: sql`count(*)::int`
      })
      .from(locations)
      .where(and(eq(locations.businessId, enrollment.businessId), eq(locations.isActive, true)));

      return {
        id: enrollment.id,
        business_id: enrollment.businessId,
        points_balance: enrollment.pointsBalance,
        total_points_earned: enrollment.lifetimePoints,
        total_spend: enrollment.lifetimeSpend,
        points_multiplier: enrollment.pointsMultiplier,
        business_name: enrollment.businessName,
        business_logo: enrollment.businessLogo,
        business_color: enrollment.businessColor,
        locations_visited: locationsVisited,
        total_locations: totalLocs?.count || 0
      };
    }));

    res.json({
      success: true,
      data: {
        enrollments: result
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch enrollments' }
    });
  }
});

// GET /api/enrollments/:business_id - Get enrollment details for a specific business
router.get('/:business_id', async (req, res) => {
  const { business_id } = req.params;
  const customerId = req.customer.id;

  try {
    const [enrollment] = await db.select({
      id: enrollments.id,
      businessId: enrollments.businessId,
      pointsBalance: enrollments.pointsBalance,
      lifetimePoints: enrollments.lifetimePoints,
      lifetimeSpend: enrollments.lifetimeSpend,
      pointsMultiplier: enrollments.pointsMultiplier,
      businessName: businesses.name,
      businessLogo: businesses.logoUrl,
      businessColor: businesses.primaryColor
    })
    .from(enrollments)
    .innerJoin(businesses, eq(enrollments.businessId, businesses.id))
    .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, business_id)));

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
      });
    }

    // Get all locations
    const locs = await db.select({
      id: locations.id,
      name: locations.name,
      icon: locations.icon,
      addressLine1: locations.addressLine1
    })
    .from(locations)
    .where(and(eq(locations.businessId, business_id), eq(locations.isActive, true)));

    // Get visits
    const visitList = await db.select({
      id: visits.id,
      locationId: visits.locationId,
      spendAmount: visits.spendAmount,
      pointsEarned: visits.pointsEarned,
      createdAt: visits.createdAt,
      locationName: locations.name,
      locationIcon: locations.icon
    })
    .from(visits)
    .innerJoin(locations, eq(visits.locationId, locations.id))
    .where(and(eq(visits.customerId, customerId), eq(locations.businessId, business_id)))
    .orderBy(desc(visits.createdAt))
    .limit(20);

    // Get unlocked rewards
    const rewardsList = await db.select({
      id: customerRewards.id,
      rewardId: customerRewards.rewardId,
      status: customerRewards.status,
      redemptionCode: customerRewards.redemptionCode,
      earnedAt: customerRewards.earnedAt,
      redeemedAt: customerRewards.redeemedAt,
      rewardName: rewards.name,
      rewardDescription: rewards.description,
      rewardIcon: rewards.icon,
      pointsRequired: rewards.pointsRequired,
      valueAmount: rewards.valueAmount,
      rewardType: rewards.rewardType
    })
    .from(customerRewards)
    .innerJoin(rewards, eq(customerRewards.rewardId, rewards.id))
    .where(and(eq(customerRewards.enrollmentId, enrollment.id), eq(rewards.businessId, business_id)))
    .orderBy(desc(customerRewards.earnedAt));

    // Get visited location IDs
    const visitedLocationIds = new Set(visitList.map(v => v.locationId));

    res.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          business_id: enrollment.businessId,
          business_name: enrollment.businessName,
          business_logo: enrollment.businessLogo,
          business_color: enrollment.businessColor,
          points_balance: enrollment.pointsBalance,
          total_points_earned: enrollment.lifetimePoints,
          total_spend: enrollment.lifetimeSpend,
          points_multiplier: enrollment.pointsMultiplier
        },
        locations: locs.map(loc => ({
          id: loc.id,
          name: loc.name,
          icon: loc.icon,
          address: loc.addressLine1,
          visited: visitedLocationIds.has(loc.id)
        })),
        visits: visitList.map(v => ({
          id: v.id,
          location_id: v.locationId,
          location_name: v.locationName,
          location_icon: v.locationIcon,
          spend_amount: v.spendAmount,
          points_earned: v.pointsEarned,
          created_at: v.createdAt
        })),
        rewards: rewardsList.map(r => ({
          id: r.id,
          reward_id: r.rewardId,
          name: r.rewardName,
          description: r.rewardDescription,
          icon: r.rewardIcon,
          points_cost: r.pointsRequired,
          dollar_value: r.valueAmount,
          reward_type: r.rewardType,
          status: r.status,
          redemption_code: r.redemptionCode,
          unlocked_at: r.earnedAt,
          redeemed_at: r.redeemedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch enrollment' }
    });
  }
});

module.exports = router;
