const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../db');
const { eq, and, desc, sql } = require('drizzle-orm');
const { authenticateCustomer } = require('../middleware/auth');

const { businesses, locations, enrollments, visits, earningRules, rules, ruleTriggers, rewards, customerRewards } = schema;

// All routes require customer authentication
router.use(authenticateCustomer);

// POST /api/transactions/check-in - Record a customer check-in
router.post('/check-in', async (req, res) => {
  const { location_id, spend_amount } = req.body;
  const customerId = req.customer.id;

  if (!location_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_LOCATION', message: 'location_id is required' }
    });
  }

  try {
    // Get location and its business
    const [location] = await db.select({
      id: locations.id,
      name: locations.name,
      icon: locations.icon,
      businessId: locations.businessId,
      isActive: locations.isActive
    })
    .from(locations)
    .where(eq(locations.id, location_id));

    if (!location || !location.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: 'LOCATION_NOT_FOUND', message: 'Location not found' }
      });
    }

    // Get or create enrollment
    let [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, location.businessId)));

    if (!enrollment) {
      const enrollmentId = generateId('enroll');
      await db.insert(enrollments).values({
        id: enrollmentId,
        customerId: customerId,
        businessId: location.businessId
      });
      [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
    }

    // Calculate points based on earning rules
    const earnRules = await db.select().from(earningRules)
      .where(and(eq(earningRules.businessId, location.businessId), eq(earningRules.isActive, true)));

    let pointsEarned = 0;
    const amount = parseFloat(spend_amount) || 0;

    for (const rule of earnRules) {
      if (rule.type === 'spend' && amount > 0) {
        pointsEarned += Math.floor(amount * (rule.pointsPerDollar || 0));
      } else if (rule.type === 'visit') {
        pointsEarned += rule.pointsPerVisit || 0;
      }
    }

    // Apply multiplier
    pointsEarned = Math.floor(pointsEarned * (enrollment.pointsMultiplier || 1));

    // Record visit
    const visitId = generateId('visit');
    await db.insert(visits).values({
      id: visitId,
      customerId: customerId,
      locationId: location_id,
      spendAmount: amount,
      pointsEarned: pointsEarned
    });

    // Update enrollment
    await db.update(enrollments)
      .set({
        pointsBalance: sql`${enrollments.pointsBalance} + ${pointsEarned}`,
        lifetimePoints: sql`${enrollments.lifetimePoints} + ${pointsEarned}`,
        lifetimeSpend: sql`${enrollments.lifetimeSpend} + ${Math.round(amount * 100)}`,
        visitCount: sql`${enrollments.visitCount} + 1`,
        lastVisitAt: new Date()
      })
      .where(eq(enrollments.id, enrollment.id));

    // Check for milestone rules
    const milestonesUnlocked = await checkMilestones(customerId, location.businessId, enrollment.id);

    // Get updated balance
    const [updatedEnrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollment.id));

    res.json({
      success: true,
      data: {
        transaction: {
          id: visitId,
          location_id,
          location_name: location.name,
          location_icon: location.icon,
          spend_amount: amount,
          points_earned: pointsEarned
        },
        new_balance: updatedEnrollment.pointsBalance,
        new_multiplier: updatedEnrollment.pointsMultiplier,
        milestones_unlocked: milestonesUnlocked
      }
    });
  } catch (error) {
    console.error('Error recording check-in:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to record check-in' }
    });
  }
});

// GET /api/transactions/history - Get transaction history
router.get('/history', async (req, res) => {
  const { business_id } = req.query;
  const customerId = req.customer.id;

  try {
    let query = db.select({
      id: visits.id,
      locationId: visits.locationId,
      spendAmount: visits.spendAmount,
      pointsEarned: visits.pointsEarned,
      createdAt: visits.createdAt,
      locationName: locations.name,
      locationIcon: locations.icon,
      businessId: locations.businessId
    })
    .from(visits)
    .innerJoin(locations, eq(visits.locationId, locations.id))
    .where(eq(visits.customerId, customerId))
    .orderBy(desc(visits.createdAt))
    .limit(50);

    if (business_id) {
      query = db.select({
        id: visits.id,
        locationId: visits.locationId,
        spendAmount: visits.spendAmount,
        pointsEarned: visits.pointsEarned,
        createdAt: visits.createdAt,
        locationName: locations.name,
        locationIcon: locations.icon,
        businessId: locations.businessId
      })
      .from(visits)
      .innerJoin(locations, eq(visits.locationId, locations.id))
      .where(and(eq(visits.customerId, customerId), eq(locations.businessId, business_id)))
      .orderBy(desc(visits.createdAt))
      .limit(50);
    }

    const transactions = await query;

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          location_id: t.locationId,
          location_name: t.locationName,
          location_icon: t.locationIcon,
          business_id: t.businessId,
          spend_amount: t.spendAmount,
          points_earned: t.pointsEarned,
          created_at: t.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch transaction history' }
    });
  }
});

// Helper function to check and trigger milestone rules
async function checkMilestones(customerId, businessId, enrollmentId) {
  const triggered = [];

  try {
    // Get all active rules for this business
    const rulesList = await db.select().from(rules)
      .where(and(eq(rules.businessId, businessId), eq(rules.isActive, true)));

    for (const rule of rulesList) {
      // Check if already triggered (for non-repeatable rules)
      if (!rule.isRepeatable) {
        const [existingTrigger] = await db.select({ id: ruleTriggers.id })
          .from(ruleTriggers)
          .where(and(eq(ruleTriggers.ruleId, rule.id), eq(ruleTriggers.enrollmentId, enrollmentId)));

        if (existingTrigger) continue;
      }

      // Check cooldown
      if (rule.cooldownDays) {
        const [lastTrigger] = await db.select({ triggeredAt: ruleTriggers.triggeredAt })
          .from(ruleTriggers)
          .where(and(eq(ruleTriggers.ruleId, rule.id), eq(ruleTriggers.enrollmentId, enrollmentId)))
          .orderBy(desc(ruleTriggers.triggeredAt))
          .limit(1);

        if (lastTrigger) {
          const cooldownEnd = new Date(lastTrigger.triggeredAt);
          cooldownEnd.setDate(cooldownEnd.getDate() + rule.cooldownDays);
          if (new Date() < cooldownEnd) continue;
        }
      }

      // Evaluate rule conditions
      const conditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions;
      const result = await evaluateConditions(conditions, customerId, businessId);

      if (result) {
        // Trigger the rule
        const triggerId = generateId('trigger');

        // Apply award
        if (rule.awardType === 'points') {
          const points = parseInt(rule.awardValue);
          await db.update(enrollments)
            .set({
              pointsBalance: sql`${enrollments.pointsBalance} + ${points}`,
              lifetimePoints: sql`${enrollments.lifetimePoints} + ${points}`
            })
            .where(eq(enrollments.id, enrollmentId));
        } else if (rule.awardType === 'reward') {
          // Unlock the reward
          const rewardId = rule.awardValue;
          const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId));

          if (reward) {
            const customerRewardId = generateId('cr');
            const redemptionCode = `RED_${generateId('')}`;
            await db.insert(customerRewards).values({
              id: customerRewardId,
              enrollmentId: enrollmentId,
              rewardId: rewardId,
              sourceType: 'rule_unlock',
              sourceId: rule.id,
              redemptionCode: redemptionCode
            });

            triggered.push({
              rule_id: rule.id,
              rule_name: rule.name,
              award_type: 'reward',
              reward_id: rewardId,
              reward_name: reward.name,
              reward_icon: reward.icon,
              reward_value: reward.valueAmount
            });
          }
        } else if (rule.awardType === 'multiplier') {
          const multiplier = parseFloat(rule.awardValue);
          await db.update(enrollments)
            .set({ pointsMultiplier: multiplier })
            .where(eq(enrollments.id, enrollmentId));
        }

        // Record the trigger
        await db.insert(ruleTriggers).values({
          id: triggerId,
          ruleId: rule.id,
          enrollmentId: enrollmentId
        });
      }
    }
  } catch (error) {
    console.error('Error checking milestones:', error);
  }

  return triggered;
}

// Evaluate rule conditions recursively
async function evaluateConditions(conditions, customerId, businessId) {
  // Single condition
  if (!conditions.operator) {
    return await evaluateSingleCondition(conditions, customerId, businessId);
  }

  // AND/OR group
  const results = await Promise.all(
    conditions.items.map(item => evaluateConditions(item, customerId, businessId))
  );

  if (conditions.operator === 'AND') {
    return results.every(r => r === true);
  } else if (conditions.operator === 'OR') {
    return results.some(r => r === true);
  }

  return false;
}

// Evaluate a single condition
async function evaluateSingleCondition(condition, customerId, businessId) {
  if (condition.type === 'time_window') {
    return true;
  }

  if (condition.type === 'day_of_week') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return condition.days.includes(today);
  }

  // Location-based conditions
  if (condition.subject === 'location') {
    if (condition.action === 'visit') {
      let count;
      if (condition.scope === 'specific') {
        const [result] = await db.select({
          count: sql`count(distinct ${visits.locationId})::int`
        })
        .from(visits)
        .where(and(eq(visits.customerId, customerId), eq(visits.locationId, condition.location_id)));
        count = result?.count || 0;
      } else {
        // 'any' scope - count distinct locations visited
        const [result] = await db.select({
          count: sql`count(distinct ${visits.locationId})::int`
        })
        .from(visits)
        .innerJoin(locations, eq(visits.locationId, locations.id))
        .where(and(eq(visits.customerId, customerId), eq(locations.businessId, businessId)));
        count = result?.count || 0;
      }

      return compare(count, condition.comparison, condition.value);
    } else if (condition.action === 'spend') {
      let total;
      if (condition.scope === 'specific') {
        const [result] = await db.select({
          total: sql`coalesce(sum(${visits.spendAmount}), 0)`
        })
        .from(visits)
        .where(and(eq(visits.customerId, customerId), eq(visits.locationId, condition.location_id)));
        total = parseFloat(result?.total) || 0;
      } else {
        const [result] = await db.select({
          total: sql`coalesce(sum(${visits.spendAmount}), 0)`
        })
        .from(visits)
        .innerJoin(locations, eq(visits.locationId, locations.id))
        .where(and(eq(visits.customerId, customerId), eq(locations.businessId, businessId)));
        total = parseFloat(result?.total) || 0;
      }

      return compare(total, condition.comparison, condition.value);
    }
  }

  return false;
}

// Compare values
function compare(actual, operator, expected) {
  switch (operator) {
    case '=': return actual === expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    default: return false;
  }
}

module.exports = router;
