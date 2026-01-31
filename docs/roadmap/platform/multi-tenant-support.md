# Multi-Tenant Support

> **Status:** Planning
> **Priority:** Critical (Tier 1 - MVP Completion)
> **Category:** Platform

---

## Overview

Remove hardcoded `biz_pilot` references and enable customers to be enrolled at multiple businesses. This is foundational for the platform to scale beyond a single pilot customer.

---

## Dependencies

- **Requires:**
  - Nothing (foundational)

- **Enables:**
  - Customer Discovery (browsing businesses)
  - Business Switcher in customer app
  - Platform-wide leaderboards
  - Notification infrastructure (multi-business context)
  - All future customer-facing features

---

## Roadmap Position

- **Tier:** 1 (MVP Completion)
- **Phase:** MVP / v1.0
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Customer Discovery](../customer/customer-discovery.md)
  - [Notification Infrastructure](./notification-infrastructure.md)
  - [Leaderboards](../customer/leaderboards.md)

---

## Current State (Problems)

### Hardcoded References

```typescript
// customer-app/src/api/client.js
const BUSINESS_ID = 'biz_pilot';  // ❌ Hardcoded

// Multiple places assume single business context
```

### Database Already Supports Multi-Tenant

The schema is already designed for multi-tenancy:
- `enrollments` table links customers to businesses
- `transactions` have `business_id` and `location_id`
- Rewards, rules, etc. are all business-scoped

**The problem is the frontend**, not the backend.

---

## Solution Design

### 1. Customer Context Management

```typescript
// New: Customer can have multiple enrollments
interface CustomerContext {
  customerId: string;
  enrollments: Enrollment[];
  activeBusinessId: string | null;  // Currently viewing
  favoriteBusinessIds: string[];
}

// Enrollment includes business details
interface Enrollment {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  points: number;
  tier: string;
  enrolledAt: string;
}
```

### 2. Business Switcher Component

```tsx
// Customer can switch between enrolled businesses
<BusinessSwitcher
  enrollments={enrollments}
  activeBusinessId={activeBusinessId}
  onSwitch={(businessId) => setActiveBusinessId(businessId)}
/>

// Shows:
// - Business logo/name
// - Current points at each
// - Easy toggle between them
```

### 3. API Updates

```typescript
// All customer endpoints now require business context
GET /api/customer/dashboard?businessId=biz_abc

// Or use header
X-Business-Id: biz_abc

// Enrollment-level endpoints don't need business context
GET /api/customer/enrollments  // Returns all enrollments
```

### 4. "All Businesses" View

Some views span all enrollments:
- Total points across all businesses
- Combined transaction history
- Platform-wide achievements
- Discovery of new businesses

```typescript
GET /api/customer/overview
{
  totalPoints: 1500,           // Sum across all
  totalBusinesses: 3,
  recentActivity: [...],       // Mixed from all
  enrollments: [...]           // Per-business breakdown
}
```

---

## Implementation Plan

### Phase 1: Backend Preparation
- [ ] Add `X-Business-Id` header support to customer routes
- [ ] Create `/api/customer/enrollments` endpoint
- [ ] Create `/api/customer/overview` endpoint
- [ ] Ensure all queries are properly scoped

### Phase 2: Customer App Refactor
- [ ] Create `BusinessContext` provider
- [ ] Add business switcher to header/nav
- [ ] Update all API calls to include business context
- [ ] Remove hardcoded `biz_pilot` references

### Phase 3: Multi-Business Views
- [ ] "All businesses" dashboard tab
- [ ] Combined transaction history view
- [ ] Cross-business statistics

### Phase 4: Discovery Integration
- [ ] "Find businesses" entry point
- [ ] Enroll from discovery flow
- [ ] Handle first-time enrollment

---

## Database Changes

No schema changes needed - existing tables support this:

```sql
-- Already exists
CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  -- Customer can have multiple enrollments
  UNIQUE(customer_id, business_id)
);
```

May add:
```sql
-- Customer's active/default business
ALTER TABLE customers ADD COLUMN default_business_id TEXT;

-- Favorite businesses (quick access)
CREATE TABLE customer_favorite_businesses (
  customer_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  position INT DEFAULT 0,
  PRIMARY KEY (customer_id, business_id)
);
```

---

## UI/UX Considerations

### First-Time Experience
1. Customer signs up with phone number
2. No enrollments yet → show discovery/search
3. First check-in creates enrollment automatically
4. Or: Enroll via QR code at business

### Business Switcher Behavior
- Always visible when enrolled at 2+ businesses
- Shows business logo + points balance
- Quick-switch dropdown
- "View All" option for overview

### Handling "No Business Selected"
- Discovery-first landing page
- "Find businesses near you"
- Or show overview of all enrollments

---

## Security Considerations

- Customers can only see their own enrollments
- Business data only visible if enrolled (or in discovery)
- Transaction history scoped to customer + business
- Rate limit enrollment creation (prevent spam)

---

## Testing Checklist

- [ ] Customer with 1 enrollment works correctly
- [ ] Customer with 5+ enrollments works correctly
- [ ] Business switcher works smoothly
- [ ] All API calls properly scoped
- [ ] No data leakage between businesses
- [ ] Discovery doesn't show enrolled businesses
- [ ] Performance acceptable with many enrollments

---

## Migration Path

1. Deploy backend changes (backward compatible)
2. Update customer app with business context
3. Remove hardcoded references
4. Test with pilot (Tony's)
5. Onboard second business to validate

---

*Last updated: January 2025*
