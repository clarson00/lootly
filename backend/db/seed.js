require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { db, schema, generateId, closePool } = require('./index');
const { sql } = require('drizzle-orm');

const {
  businesses,
  locations,
  locationGroups,
  locationGroupMembers,
  staff,
  customers,
  enrollments,
  earningRules,
  rewards,
  rules,
  qrCodes
} = schema;

async function seed() {
  console.log('Seeding database...');

  try {
    // Clear existing data (in reverse dependency order)
    console.log('Clearing existing data...');
    await db.delete(schema.ruleTriggers);
    await db.delete(schema.customerRewards);
    await db.delete(schema.transactions);
    await db.delete(schema.visits);
    await db.delete(qrCodes);
    await db.delete(enrollments);
    await db.delete(customers);
    await db.delete(staff);
    await db.delete(rules);
    await db.delete(rewards);
    await db.delete(earningRules);          // Must come before locationGroups
    await db.delete(locationGroupMembers);
    await db.delete(locationGroups);
    await db.delete(locations);
    await db.delete(businesses);

    // Insert business
    const business = {
      id: 'biz_pilot',
      name: "Tony's Restaurant Group",
      logoUrl: null,
      primaryColor: '#f59e0b'
    };

    await db.insert(businesses).values(business);
    console.log('Created business:', business.name);

    // Insert locations
    const locs = [
      { id: 'loc_1', businessId: 'biz_pilot', name: "Tony's Pizza", icon: '🍕', addressLine1: '123 Main St' },
      { id: 'loc_2', businessId: 'biz_pilot', name: 'Casa Verde', icon: '🌮', addressLine1: '456 Oak Ave' },
      { id: 'loc_3', businessId: 'biz_pilot', name: 'Bella Italia', icon: '🍝', addressLine1: '789 Elm St' },
      { id: 'loc_4', businessId: 'biz_pilot', name: 'Dragon Wok', icon: '🥡', addressLine1: '321 Pine Rd' }
    ];

    for (const loc of locs) {
      await db.insert(locations).values(loc);
      console.log('Created location:', loc.name);
    }

    // Create "All Locations" group
    const allLocationsGroup = {
      id: 'grp_all',
      businessId: 'biz_pilot',
      name: 'All Locations'
    };

    await db.insert(locationGroups).values(allLocationsGroup);

    // Add all locations to the group
    for (const loc of locs) {
      await db.insert(locationGroupMembers).values({
        id: generateId('lgm'),
        groupId: allLocationsGroup.id,
        locationId: loc.id
      });
    }

    console.log('Created location group:', allLocationsGroup.name);

    // Create earning rule: 1 point per dollar
    const earningRule = {
      id: 'rule_standard',
      businessId: 'biz_pilot',
      name: 'Standard Earning',
      type: 'spend',
      pointsPerDollar: 1,
      locationGroupId: 'grp_all'
    };

    await db.insert(earningRules).values(earningRule);
    console.log('Created earning rule:', earningRule.name);

    // Create rewards
    const rewardsList = [
      {
        id: 'reward_1',
        businessId: 'biz_pilot',
        name: 'Free Pizza',
        description: "One free personal pizza at Tony's Pizza",
        icon: '🍕',
        pointsRequired: 100,
        rewardType: 'points_redemption',
        valueType: 'free_item',
        valueAmount: '15'
      },
      {
        id: 'reward_2',
        businessId: 'biz_pilot',
        name: 'Free Nachos',
        description: 'Free loaded nachos at Casa Verde',
        icon: '🌮',
        pointsRequired: 100,
        rewardType: 'points_redemption',
        valueType: 'free_item',
        valueAmount: '12'
      },
      {
        id: 'reward_3',
        businessId: 'biz_pilot',
        name: 'Free Pasta',
        description: 'Free pasta dish at Bella Italia',
        icon: '🍝',
        pointsRequired: 100,
        rewardType: 'points_redemption',
        valueType: 'free_item',
        valueAmount: '14'
      },
      {
        id: 'reward_4',
        businessId: 'biz_pilot',
        name: 'Free Combo',
        description: 'Free combo meal at Dragon Wok',
        icon: '🥡',
        pointsRequired: 100,
        rewardType: 'points_redemption',
        valueType: 'free_item',
        valueAmount: '13'
      },
      {
        id: 'reward_grand_tour',
        businessId: 'biz_pilot',
        name: '$50 Off Grand Tour',
        description: 'Visit all 4 locations to unlock! $50 off your next order anywhere.',
        icon: '🏆',
        pointsRequired: 0,
        rewardType: 'milestone',
        valueType: 'fixed_discount',
        valueAmount: '50'
      }
    ];

    for (const reward of rewardsList) {
      await db.insert(rewards).values(reward);
      console.log('Created reward:', reward.name);
    }

    // Create Grand Tour rule
    const grandTourRule = {
      id: 'rule_grand_tour',
      businessId: 'biz_pilot',
      name: 'Grand Tour',
      description: 'Visit all 4 locations to unlock epic rewards!',
      conditions: {
        operator: 'AND',
        items: [
          { subject: 'location', scope: 'specific', location_id: 'loc_1', action: 'visit', comparison: '>=', value: 1 },
          { subject: 'location', scope: 'specific', location_id: 'loc_2', action: 'visit', comparison: '>=', value: 1 },
          { subject: 'location', scope: 'specific', location_id: 'loc_3', action: 'visit', comparison: '>=', value: 1 },
          { subject: 'location', scope: 'specific', location_id: 'loc_4', action: 'visit', comparison: '>=', value: 1 }
        ]
      },
      awardType: 'reward',
      awardValue: 'reward_grand_tour',
      isRepeatable: false
    };

    await db.insert(rules).values(grandTourRule);
    console.log('Created rule:', grandTourRule.name);

    // Create staff for each location (PIN: 1234)
    const pinHash = bcrypt.hashSync('1234', 10);

    for (const loc of locs) {
      const staffId = `staff_${loc.id}`;
      await db.insert(staff).values({
        id: staffId,
        locationId: loc.id,
        name: `${loc.name} Staff`,
        pinHash: pinHash
      });
      console.log('Created staff for:', loc.name);
    }

    // Create a test customer
    const testCustomer = {
      id: 'cust_test',
      phone: '+15551234567',
      name: 'Test Customer',
      email: 'test@example.com'
    };

    await db.insert(customers).values(testCustomer);

    // Create QR code for test customer
    await db.insert(qrCodes).values({
      id: generateId('qr'),
      customerId: testCustomer.id,
      code: `lootly:customer:${testCustomer.id}`,
      type: 'primary'
    });

    console.log('Created test customer:', testCustomer.phone);

    // Enroll test customer in pilot business
    const testEnrollment = {
      id: 'enroll_test',
      customerId: 'cust_test',
      businessId: 'biz_pilot',
      pointsBalance: 50,
      lifetimePoints: 50,
      lifetimeSpend: 5000 // cents
    };

    await db.insert(enrollments).values(testEnrollment);
    console.log('Enrolled test customer in business');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('  Customer phone: +15551234567 (code: 1234)');
    console.log('  Staff PIN: 1234 (any location)');

  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
