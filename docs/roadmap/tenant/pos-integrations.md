# POS Integrations

> **Status:** 💡 Idea
> **Priority:** High (defensible moat)
> **Entitlement:** Pro+
> **Spec:** Not yet written

---

## Overview

Integrate with point-of-sale systems to automatically award points when customers make purchases. No manual entry required.

## Target POS Systems

### Phase 1 (High Priority)
1. **Square** - Dominant in SMB market, good API
2. **Toast** - Restaurant-focused, high penetration
3. **Clover** - Wide adoption, app marketplace

### Phase 2
4. **Lightspeed** - Retail/restaurant focus
5. **Shopify POS** - For businesses with retail + e-commerce
6. **TouchBistro** - Restaurant-specific

### Phase 3
7. **Revel** - Enterprise restaurants
8. **Aloha** (NCR) - Large chains
9. **Micros** (Oracle) - Enterprise

## Integration Approach

### Webhook-Based (Preferred)
- POS sends transaction data to RewardsPirate
- Real-time point award
- Customer matched by phone number at checkout

### Polling-Based (Fallback)
- Periodic sync of transactions
- Near-real-time (5-15 min delay)
- For POS systems with limited webhook support

## Customer Identification

1. **Phone lookup at checkout** - Staff enters phone, system checks enrollment
2. **Loyalty app integration** - Customer app sends ID to POS
3. **Payment card linking** - Match card used at enrollment (future)

## Data Flow

```
POS Transaction → RewardsPirate API
  ↓
Match customer by phone
  ↓
Calculate points (amount × rate × multiplier)
  ↓
Award points, check rules, update balance
  ↓
Send confirmation (optional SMS/push)
```

## Why This Matters

- **Reduces friction** - No manual staff entry
- **Increases accuracy** - No human error
- **Defensible moat** - Hard for competitors to replicate quickly
- **Brick-and-mortar fit** - E-commerce competitors don't have this

## Technical Considerations

- OAuth flows for each POS
- Webhook signature verification
- Idempotency (don't double-award)
- Offline/retry handling
- Multi-location mapping

---

*Spec to be written when prioritized for development.*
