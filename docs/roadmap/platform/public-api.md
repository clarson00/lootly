# Public API / SDK

> **Status:** 📋 Planned
> **Priority:** High - Enables third-party integrations
> **Entitlement:** Pro tier or API Add-on

---

## Dependencies

- **Requires:**
  - Multi-tenant support (complete)
  - Authentication infrastructure (existing)
  - Rate limiting infrastructure
  - API key management system

- **Enables:**
  - **E-commerce Plugins** (WooCommerce, Shopify, JS snippets)
  - Third-party app integrations
  - Custom implementations
  - Headless/API-first deployments

---

## Roadmap Position

- **Tier:** 3-4 (Engagement/Gamification)
- **Phase:** v1.2-v2.0
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [E-commerce Plugins](./ecommerce-plugins.md) - **DEPENDS ON THIS**
  - [POS Integrations](../tenant/pos-integrations.md)
  - [Multi-Tenant Support](./multi-tenant-support.md)

---

## Overview

A public REST API that allows third-party developers, e-commerce platforms, and custom implementations to integrate with Rewards Pirate. This is the foundation for all external integrations.

---

## API Scope

### What's Exposed

| Resource | Operations | Use Case |
|----------|------------|----------|
| Customers | Lookup, Create, Update | Identify/enroll customers |
| Points | Award, Deduct, Balance | Transaction integration |
| Rewards | List, Check eligibility, Redeem | Redemption flows |
| Transactions | Create, List | Record purchases |
| Enrollments | Create, Check | Membership management |

### What's NOT Exposed (Admin-Only)

- Rule/Voyage configuration
- Business settings
- Staff management
- Analytics data (separate endpoint, higher tier)

---

## Authentication

### API Keys

```
┌─────────────────────────────────────────────────────────────┐
│ API Keys                                           [+ New]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Production Keys                                             │
│ ─────────────────────────────────────────────────────────   │
│ pk_live_abc123...xyz    Created Jan 15    [Revoke]         │
│   Permissions: customers, points, rewards                   │
│   Last used: 2 hours ago                                   │
│                                                             │
│ Test Keys                                                   │
│ ─────────────────────────────────────────────────────────   │
│ pk_test_def456...uvw    Created Jan 10    [Revoke]         │
│   Permissions: all (test mode)                             │
│   Last used: 5 minutes ago                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Header

```http
Authorization: Bearer pk_live_abc123...
X-Business-Id: biz_tonys  # Optional if key is business-scoped
```

### Key Types

| Type | Prefix | Environment | Rate Limit |
|------|--------|-------------|------------|
| Test | `pk_test_` | Sandbox | 1000/min |
| Live | `pk_live_` | Production | Per plan |
| Server | `sk_live_` | Server-side only | Per plan |

---

## Core Endpoints

### Customer Lookup

```http
GET /api/v1/customers/lookup?phone=+15551234567

Response:
{
  "customer": {
    "id": "cust_abc123",
    "phone": "+15551234567",
    "displayName": "Sarah M.",
    "enrolled": true,
    "enrollmentId": "enroll_xyz",
    "points": 1234,
    "tier": "gold",
    "memberSince": "2024-06-15"
  }
}

# If not found
{
  "customer": null,
  "enrolled": false
}
```

### Award Points

```http
POST /api/v1/points/award
{
  "customerId": "cust_abc123",     # or use phone lookup
  "phone": "+15551234567",          # alternative to customerId
  "points": 50,
  "amount": 50.00,                  # Purchase amount (for rules)
  "locationId": "loc_downtown",     # Optional
  "reference": "order_12345",       # Your order ID
  "metadata": {                     # Optional custom data
    "orderId": "12345",
    "source": "shopify"
  }
}

Response:
{
  "success": true,
  "transaction": {
    "id": "txn_abc123",
    "pointsAwarded": 50,
    "bonusPointsAwarded": 25,       # From active rules
    "newBalance": 1309,
    "rulesTriggered": ["rule_weekend_bonus"]
  },
  "rewards": {                      # Newly unlocked rewards
    "unlocked": ["reward_free_appetizer"],
    "message": "You unlocked Free Appetizer!"
  }
}
```

### Check Rewards

```http
GET /api/v1/customers/{id}/rewards

Response:
{
  "available": [
    {
      "id": "reward_free_appetizer",
      "name": "Free Appetizer",
      "pointsCost": 500,
      "canRedeem": true
    }
  ],
  "locked": [
    {
      "id": "reward_free_entree",
      "name": "Free Entree",
      "pointsCost": 1000,
      "pointsNeeded": 191
    }
  ]
}
```

### Redeem Reward

```http
POST /api/v1/rewards/redeem
{
  "customerId": "cust_abc123",
  "rewardId": "reward_free_appetizer",
  "locationId": "loc_downtown",
  "reference": "order_12345"
}

Response:
{
  "success": true,
  "redemption": {
    "id": "redemp_xyz789",
    "reward": "Free Appetizer",
    "pointsDeducted": 500,
    "newBalance": 809
  }
}
```

### Create Enrollment

```http
POST /api/v1/enrollments
{
  "phone": "+15559876543",
  "firstName": "John",              # Optional
  "lastName": "Doe",                # Optional
  "email": "john@example.com",      # Optional
  "source": "shopify_checkout"      # For attribution
}

Response:
{
  "success": true,
  "customer": {
    "id": "cust_new123",
    "enrollmentId": "enroll_abc",
    "isNew": true,                  # vs returning customer
    "welcomeBonus": 50              # If configured
  }
}
```

---

## Webhooks

### Outbound Webhooks

Notify external systems of events:

```http
POST https://your-server.com/webhooks/rewards-pirate

{
  "event": "points.awarded",
  "timestamp": "2025-01-30T12:00:00Z",
  "data": {
    "customerId": "cust_abc123",
    "points": 50,
    "newBalance": 1309,
    "transactionId": "txn_xyz"
  },
  "signature": "sha256=abc123..."
}
```

### Event Types

| Event | Trigger |
|-------|---------|
| `customer.enrolled` | New enrollment |
| `points.awarded` | Points added |
| `points.deducted` | Points removed |
| `reward.unlocked` | Reward becomes available |
| `reward.redeemed` | Reward claimed |
| `voyage.progress` | Voyage step completed |
| `voyage.completed` | Voyage finished |

---

## Rate Limiting

| Plan | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 60 | 1,000 |
| Starter | 120 | 10,000 |
| Pro | 600 | 100,000 |
| Enterprise | Custom | Custom |

### Rate Limit Headers

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 598
X-RateLimit-Reset: 1706619600
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "No customer found with phone +15551234567",
    "status": 404,
    "details": {
      "phone": "+15551234567"
    }
  }
}
```

### Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_API_KEY` | 401 | Bad or missing API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CUSTOMER_NOT_FOUND` | 404 | Customer doesn't exist |
| `INSUFFICIENT_POINTS` | 400 | Not enough points to redeem |
| `REWARD_NOT_AVAILABLE` | 400 | Reward locked or unavailable |
| `INVALID_REQUEST` | 400 | Malformed request body |

---

## SDKs (Future)

### JavaScript/TypeScript

```typescript
import { RewardsPirate } from '@rewards-pirate/sdk';

const rp = new RewardsPirate('pk_live_abc123');

// Lookup customer
const customer = await rp.customers.lookup({ phone: '+15551234567' });

// Award points
const result = await rp.points.award({
  customerId: customer.id,
  points: 50,
  amount: 50.00,
  reference: 'order_12345'
});
```

### PHP (for WooCommerce)

```php
use RewardsPirate\Client;

$rp = new Client('pk_live_abc123');

$customer = $rp->customers->lookup(['phone' => '+15551234567']);
$result = $rp->points->award([
  'customerId' => $customer->id,
  'points' => 50
]);
```

---

## Implementation Plan

### Phase 1: Core API
- [ ] API key generation and management
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] Customer lookup endpoint
- [ ] Points award/deduct endpoints

### Phase 2: Full CRUD
- [ ] Enrollment endpoint
- [ ] Rewards list/redeem endpoints
- [ ] Transaction history endpoint
- [ ] Error handling standardization

### Phase 3: Webhooks
- [ ] Webhook configuration UI
- [ ] Event emission system
- [ ] Signature verification
- [ ] Retry logic

### Phase 4: SDKs
- [ ] JavaScript/TypeScript SDK
- [ ] PHP SDK (for WordPress/WooCommerce)
- [ ] Documentation site

---

## Security Considerations

- API keys hashed in database (only shown once on creation)
- IP allowlisting (optional, Enterprise)
- Request signing for webhooks
- Audit log of all API calls
- Automatic key rotation reminders

---

## Open Questions

1. **Versioning strategy?** URL versioning (`/v1/`) or header?
2. **GraphQL?** REST-only or also offer GraphQL?
3. **SDK priority?** Which languages first?
4. **Sandbox environment?** Separate test environment or test mode flag?

---

*Last updated: January 2025*
