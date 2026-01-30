# Lootly Seed Data - Pilot Customer

> **Business:** Tony's Restaurant Group
> **Locations:** 4 restaurants
> **Subscription:** Free tier (for testing feature gating)

## Business

```javascript
const business = {
  id: 'biz_pilot',
  name: "Tony's Restaurant Group",
  primaryColor: '#f59e0b',
  subscriptionTier: 'free'  // For testing feature gating
};
```

## Locations

```javascript
const locations = [
  {
    id: 'loc_1',
    businessId: 'biz_pilot',
    name: "Tony's Pizza",
    icon: '🍕',
    addressLine1: '123 Main St'
  },
  {
    id: 'loc_2',
    businessId: 'biz_pilot',
    name: 'Casa Verde',
    icon: '🌮',
    addressLine1: '456 Oak Ave'
  },
  {
    id: 'loc_3',
    businessId: 'biz_pilot',
    name: 'Bella Italia',
    icon: '🍝',
    addressLine1: '789 Elm St'
  },
  {
    id: 'loc_4',
    businessId: 'biz_pilot',
    name: 'Dragon Wok',
    icon: '🥡',
    addressLine1: '321 Pine Rd'
  }
];
```

## Location Group

```javascript
const locationGroup = {
  id: 'grp_all',
  businessId: 'biz_pilot',
  name: 'All Locations',
  // Includes all 4 locations
};
```

## Earning Rules

```javascript
const earningRules = [
  {
    id: 'rule_standard',
    businessId: 'biz_pilot',
    name: 'Standard Earning',
    type: 'spend',
    pointsPerDollar: 1,  // 1 point per $1 spent
    locationGroupId: 'grp_all'
  }
];
```

## Rewards

```javascript
const rewards = [
  // Points-based rewards (100 pts each)
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

  // Milestone reward (unlocked by Grand Tour rule)
  {
    id: 'reward_grand_tour',
    businessId: 'biz_pilot',
    name: '$50 Off Grand Tour',
    description: 'Visit all 4 locations to unlock! $50 off your next order anywhere.',
    icon: '🏆',
    pointsRequired: 0,  // Unlocked by rule, not points
    rewardType: 'milestone',
    valueType: 'fixed_discount',
    valueAmount: '50'
  }
];
```

## Rules (Milestones)

```javascript
const rules = [
  {
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
  }
];
```

## Staff

```javascript
// One staff member per location, all with PIN: 1234
const staff = [
  { id: 'staff_loc_1', locationId: 'loc_1', name: "Tony's Pizza Staff", pinHash: bcrypt('1234') },
  { id: 'staff_loc_2', locationId: 'loc_2', name: 'Casa Verde Staff', pinHash: bcrypt('1234') },
  { id: 'staff_loc_3', locationId: 'loc_3', name: 'Bella Italia Staff', pinHash: bcrypt('1234') },
  { id: 'staff_loc_4', locationId: 'loc_4', name: 'Dragon Wok Staff', pinHash: bcrypt('1234') }
];
```

## Test Customer

```javascript
const testCustomer = {
  id: 'cust_test',
  phone: '+15551234567',
  name: 'Test Customer',
  email: 'test@example.com'
};

const testEnrollment = {
  id: 'enroll_test',
  customerId: 'cust_test',
  businessId: 'biz_pilot',
  pointsBalance: 50,
  lifetimePoints: 50,
  lifetimeSpend: 5000  // cents ($50)
};

const testQrCode = {
  customerId: 'cust_test',
  code: 'lootly:customer:cust_test',
  type: 'primary'
};
```

## Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Business | 1 | Tony's Restaurant Group (free tier) |
| Locations | 4 | Pizza, Mexican, Italian, Asian |
| Location Groups | 1 | All Locations |
| Earning Rules | 1 | 1 point per $1 spent |
| Rewards | 5 | 4 points-based (100 pts) + 1 milestone |
| Rules | 1 | Grand Tour milestone |
| Staff | 4 | 1 per location (PIN: 1234) |
| Test Customer | 1 | Phone: +15551234567 |

## Test Credentials

| Role | Credential | Value |
|------|------------|-------|
| Customer Phone | +15551234567 | |
| Verification Code | 1234 | (MVP accepts any 4-digit code) |
| Staff PIN | 1234 | (any location) |

## Location Icons

| Location | Icon |
|----------|------|
| Tony's Pizza | 🍕 |
| Casa Verde | 🌮 |
| Bella Italia | 🍝 |
| Dragon Wok | 🥡 |

---

*This file documents `backend/db/seed.js`. Run `npm run seed` in the backend folder to populate the database.*
