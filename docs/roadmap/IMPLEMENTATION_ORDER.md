# Implementation Order & Dependency Map

> **Purpose:** Single source of truth for feature sequencing - preventing rework by building features in the right order
> **Philosophy:** Foundations first. Features that depend on other features come later.
> **Last Updated:** January 2025

---

## Guiding Principles

1. **Dependencies First:** Never implement a feature before its dependencies exist
2. **Infrastructure Before Features:** Build the plumbing before the fixtures
3. **Vertical Slices:** Complete features end-to-end before starting new ones
4. **User Value:** Each tier should deliver standalone value to users

---

## Dependency Graph (Visual)

```
                         ┌─────────────────────────────────────────┐
                         │         TIER 5: WEB EXPERIENCE          │
                         │   Customer Web Dashboard, Advanced      │
                         │   Analytics                             │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         TIER 4: GAMIFICATION            │
                         │   Friend System, Discovery, Leaderboards│
                         │   Referrals, AI Assistant, Creator Pts  │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         TIER 3: ENGAGEMENT              │
                         │   Marketing Messages, Notifications,    │
                         │   Basic Analytics, Budget Tracking      │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         TIER 2: INFRASTRUCTURE          │
                         │   Push Notifications, Analytics Model,  │
                         │   Time-Bound Promos, Vertical Templates │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         TIER 1: MVP COMPLETION          │
                         │   Check-in Methods, Marketing Social,   │
                         │   Multi-Tenant, Tenant Onboarding       │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         TIER 0: FOUNDATION ✅           │
                         │   Database, Auth, Rules Engine, Rewards │
                         │   Voyages, Entitlements                 │
                         └─────────────────────────────────────────┘

    ═══════════════════════════════════════════════════════════════════
                         PARALLEL TRACKS (Independent)
    ═══════════════════════════════════════════════════════════════════

    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │   MARKETING     │  │  INTEGRATIONS   │  │   ARCHIVED      │
    │                 │  │                 │  │   (Dropped)     │
    │ - Messages      │  │ - POS           │  │                 │
    │ - Social Posts  │  │ - Payments      │  │ - Yield Points  │
    │ - Email         │  │ - Webhooks      │  │ - Yield Engine  │
    └─────────────────┘  └─────────────────┘  │ - Tokenomics    │
                                              └─────────────────┘
```

---

## Tier Overview

```
TIER 0: FOUNDATION          ✅ Complete
    │
    ▼
TIER 1: MVP COMPLETION      ⏳ Current Focus
    │
    ▼
TIER 2: CORE INFRASTRUCTURE 📋 Next Up
    │
    ▼
TIER 3: ENGAGEMENT LAYER    📋 Planned
    │
    ▼
TIER 4: GAMIFICATION        💡 Future
    │
    ▼
TIER 5: WEB EXPERIENCE      💡 Future
```

---

## TIER 0: FOUNDATION ✅

**Status:** Complete

These are the building blocks everything else depends on.

| Feature | Spec | Status |
|---------|------|--------|
| Check-in Model | [customer/check-in-model.md](customer/check-in-model.md) | ✅ Done |
| Rules Engine (core) | [RULES_ENGINE.md](../RULES_ENGINE.md) | ✅ Done |
| Database Schema | [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) | ✅ Done |
| Customer Auth | [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md) | ✅ Done |
| Staff Auth | [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md) | ✅ Done |
| Tenant Auth | [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md) | ✅ Done |
| Basic Rewards | [GAMIFICATION.md](../GAMIFICATION.md) | ✅ Done |
| Voyages (Rulesets) | [RULES_ENGINE.md](../RULES_ENGINE.md) | ✅ Done |
| Entitlements System | [ENTITLEMENTS.md](../ENTITLEMENTS.md) | ✅ Done |

---

## TIER 1: MVP COMPLETION ⏳

**Status:** In Progress (Current Focus)

Complete the MVP feature set for pilot launch.

| Feature | Spec | Depends On | Status | Notes |
|---------|------|------------|--------|-------|
| Check-in Methods | [customer/check-in-methods.md](customer/check-in-methods.md) | Tier 0 | ⏳ In Progress | Phone lookup, receipt OCR |
| Marketing Social Posting | [tenant/marketing-social-posting.md](tenant/marketing-social-posting.md) | Tier 0 | ⏳ Polish | AI-powered social content |
| Multi-Tenant Support | [platform/multi-tenant-support.md](platform/multi-tenant-support.md) | Tier 0 | 📋 Ready | Remove biz_pilot hardcoding |
| Tenant Onboarding | [tenant/tenant-onboarding.md](tenant/tenant-onboarding.md) | Tier 0 | 🔷 Specified | Phone → business info → dashboard |

**Blockers:** These features must complete before ANY Tier 2+ work begins.

---

## TIER 2: CORE INFRASTRUCTURE 📋

**Status:** Planned (v1.1)

Build infrastructure that enables engagement features.

| Feature | Spec | Depends On | Priority | Notes |
|---------|------|------------|----------|-------|
| Push Notification Infrastructure | [platform/notification-infrastructure.md](platform/notification-infrastructure.md) | Multi-Tenant | 🔴 Critical | Foundation for all notifications |
| **Reward Monetary Values** | [platform/reward-monetary-values.md](platform/reward-monetary-values.md) | Tier 0 | 🔴 Critical | **WALL** - Enables budget tracking, gift cards |
| **Platform Growth Branding** | [platform/growth-branding.md](platform/growth-branding.md) | Marketing features | 🟡 High | Viral growth CTAs on marketing content |
| Analytics Data Model | TBD | Tier 0 | 🔴 Critical | Required for AI assistant, dashboards |
| Time-bound Promos | [platform/time-bound-promos.md](platform/time-bound-promos.md) | Rules Engine | 🟡 High | Uses existing rules engine |
| Vertical Templates | [tenant/vertical-templates.md](tenant/vertical-templates.md) | Rules Engine | 🟡 High | Faster tenant onboarding |
| **Tenant Acquisition Incentives** | [platform/tenant-acquisition-incentives.md](platform/tenant-acquisition-incentives.md) | Multi-Tenant | 🔴 Critical | First Mates program, hardware, solves sparse market |
| **Visual Experience Engine** | [platform/visual-experience-engine.md](platform/visual-experience-engine.md) | Tenant Onboarding, AI API | 🟡 High | AI-generated celebration scenes |

### Dependency Graph

```
Multi-Tenant Support          Reward Monetary Values
       │                              │
       ├──────────────────┐           ├─────────────────┐
       ▼                  ▼           ▼                 ▼
Notification Infra    Analytics    Budget Tracking   Gift Cards
       │                  │
       ▼                  ▼
Marketing Messages    AI Marketing
```

---

## TIER 3: ENGAGEMENT LAYER 📋

**Status:** Planned (v1.1-v1.2)

Features that drive customer and tenant engagement.

| Feature | Spec | Depends On | Priority |
|---------|------|------------|----------|
| Marketing Messages | [tenant/marketing-messages.md](tenant/marketing-messages.md) | Notification Infra | 🔴 High |
| Customer Notification Digest | [customer/notifications-digest.md](customer/notifications-digest.md) | Notification Infra | 🔴 High |
| Basic Tenant Analytics | [tenant/analytics-reporting.md](tenant/analytics-reporting.md) | Analytics Data Model | 🟡 Medium |
| **Budget Tracking** | [tenant/budget-tracking.md](tenant/budget-tracking.md) | **Reward Monetary Values** | 🟡 Medium |
| **Social Sharing Rewards** | [customer/social-sharing-rewards.md](customer/social-sharing-rewards.md) | Rules Engine | 🟡 Medium |
| **Platform Streaks & Daily Rewards** | [customer/platform-streaks-rewards.md](customer/platform-streaks-rewards.md) | Notification Infra | 🟡 Medium | Drives daily engagement |
| **Public API/SDK** | [platform/public-api.md](platform/public-api.md) | Multi-Tenant | 🟡 Medium | **WALL** - Enables e-commerce plugins |
| **Feedback & Testimonials** | [platform/feedback-testimonials.md](platform/feedback-testimonials.md) | Customer App, Platform Admin | 🟡 Medium | Reviews → Google/Yelp push, tenant value |

### Why This Order?

1. **Notifications first:** Can't send marketing messages without push infrastructure
2. **Digest system:** Prevents notification fatigue with multi-business support
3. **Analytics:** Needed before AI assistant can make recommendations
4. **Reward Values → Budget:** Must have monetary values before tracking budgets
5. **Public API:** Must exist before e-commerce plugins can consume it

---

## TIER 4: GAMIFICATION 💡

**Status:** Future (v2.0)

Social and competitive features that drive viral growth.

| Feature | Spec | Depends On | Priority |
|---------|------|------------|----------|
| Friend System | [customer/friend-system.md](customer/friend-system.md) | Multi-Tenant | 🔴 First |
| Customer Discovery | [customer/customer-discovery.md](customer/customer-discovery.md) | Multi-Tenant | 🟡 High |
| Leaderboards | [customer/leaderboards.md](customer/leaderboards.md) | Friend System, Analytics | 🟡 High |
| Referrals | [customer/referrals.md](customer/referrals.md) | Friend System | 🟡 Medium |
| **Gift Card Redemption** | [customer/gift-card-redemption.md](customer/gift-card-redemption.md) | **Reward Monetary Values** | 🟡 Medium |
| **Configurable Themes** | [platform/configurable-themes.md](platform/configurable-themes.md) | UI Abstraction | 🟡 Medium |
| **E-commerce Plugins** | [platform/ecommerce-plugins.md](platform/ecommerce-plugins.md) | **Public API** | 🟡 Medium |
| Physical Rewards | [customer/physical-rewards.md](customer/physical-rewards.md) | Fulfillment Partner | 🟢 Lower |
| AI Marketing Assistant | [tenant/ai-marketing-assistant.md](tenant/ai-marketing-assistant.md) | Analytics Data | 🟢 Lower |
| Creator Points | [tenant/creator-points.md](tenant/creator-points.md) | Analytics, Fulfillment | 🟢 Lower |

### Dependency Graph

```
Multi-Tenant Support              Reward Monetary Values        Public API
       │                                   │                        │
       ├─────────────────┬─────────┐       │                        │
       ▼                 ▼         ▼       ▼                        ▼
Friend System    Discovery    Analytics  Gift Cards         E-commerce Plugins
       │                          │
       ├──────────────────────────┤
       ▼                          ▼
  Leaderboards              AI Marketing
       │
       ▼
   Referrals
```

---

## TIER 5: CUSTOMER WEB EXPERIENCE 💡

**Status:** Future (v2.0+)

Rich desktop experience for power users.

| Feature | Spec | Depends On | Priority |
|---------|------|------------|----------|
| Customer Web Dashboard | [customer/customer-web-dashboard.md](customer/customer-web-dashboard.md) | Leaderboards, Analytics | 🟡 Medium |
| Advanced Analytics | [tenant/analytics-reporting.md](tenant/analytics-reporting.md) | Basic Analytics | 🟢 Lower |

---

## ARCHIVED (Dropped) ❌

Features removed from the roadmap. Kept for reference only.

| Feature | Spec | Reason |
|---------|------|--------|
| Yield Points | [archive/yield-points.md](archive/yield-points.md) | Crypto features off table |
| Yield Engine | [archive/yield-engine.md](archive/yield-engine.md) | Crypto features off table |
| Tokenomics | [archive/tokenomics.md](archive/tokenomics.md) | Crypto features off table |
| Crypto Rewards | [archive/crypto-rewards.md](archive/crypto-rewards.md) | Crypto features off table |

---

## Critical Dependencies (Don't Skip!)

### If You Skip This... → You'll Have to Rework This

| Skip | Rework Required |
|------|-----------------|
| Rules Engine | Every bounty, promo, voyage, event |
| XP/Currency tables | All gamification features |
| Attribution tracking | Tenant rewards, analytics |
| Notification infrastructure | All messaging features |
| Analytics aggregation | AI assistant, reports |

---

## Implementation Checklist Template

When starting a new feature:

```markdown
## Pre-Implementation Checklist

- [ ] Read the feature spec completely
- [ ] Verify all dependencies are complete
- [ ] Check related specs for integration points
- [ ] Review ARCHITECTURE.md for patterns
- [ ] Review ENTITLEMENTS.md for feature gating
- [ ] Identify database schema changes
- [ ] Identify API endpoints needed
- [ ] Identify UI changes needed

## Post-Implementation Checklist

- [ ] Feature gating implemented
- [ ] Multi-tenant queries scoped
- [ ] Tests written
- [ ] Documentation updated
- [ ] Spec marked as complete
```

---

## Cross-Reference Index

Quick reference for finding specs by topic:

### Customer-Facing
- Check-in: [customer/check-in-model.md](customer/check-in-model.md), [customer/check-in-methods.md](customer/check-in-methods.md)
- Social: [customer/friend-system.md](customer/friend-system.md), [customer/leaderboards.md](customer/leaderboards.md), [customer/social-sharing-rewards.md](customer/social-sharing-rewards.md)
- Discovery: [customer/customer-discovery.md](customer/customer-discovery.md)
- Notifications: [customer/notifications-digest.md](customer/notifications-digest.md)
- Rewards: [customer/physical-rewards.md](customer/physical-rewards.md), [customer/referrals.md](customer/referrals.md), [customer/gift-card-redemption.md](customer/gift-card-redemption.md)
- Web: [customer/customer-web-dashboard.md](customer/customer-web-dashboard.md)
- Journeys: [customer/user-journeys.md](customer/user-journeys.md) and related journey specs
- Engagement: [customer/platform-streaks-rewards.md](customer/platform-streaks-rewards.md)

### Tenant (Business Owner)
- Marketing: [tenant/marketing-social-posting.md](tenant/marketing-social-posting.md), [tenant/marketing-messages.md](tenant/marketing-messages.md)
- Analytics: [tenant/analytics-reporting.md](tenant/analytics-reporting.md), [tenant/budget-tracking.md](tenant/budget-tracking.md)
- AI: [tenant/ai-marketing-assistant.md](tenant/ai-marketing-assistant.md)
- Onboarding: [tenant/tenant-onboarding.md](tenant/tenant-onboarding.md), [tenant/vertical-templates.md](tenant/vertical-templates.md)
- Gamification: [tenant/creator-points.md](tenant/creator-points.md), [tenant/tenant-rewards-program.md](tenant/tenant-rewards-program.md)
- Integrations: [tenant/pos-integrations.md](tenant/pos-integrations.md)

### Gamification v2 (Tier 4 - Future)
- Overview: [gamification/gamification-v2-overview.md](gamification/gamification-v2-overview.md)
- Currency: [gamification/gamification-currency.md](gamification/gamification-currency.md)
- Collectibles: [gamification/gamification-collectibles.md](gamification/gamification-collectibles.md)
- Crews: [gamification/gamification-crews.md](gamification/gamification-crews.md)
- Bounties: [gamification/gamification-bounties.md](gamification/gamification-bounties.md)
- Events: [gamification/gamification-events-raids.md](gamification/gamification-events-raids.md)
- Predictions: [gamification/gamification-predictions.md](gamification/gamification-predictions.md)
- Data Model: [gamification/gamification-data-model.md](gamification/gamification-data-model.md)
- Tenant Tools: [gamification/gamification-tenant-collaboration.md](gamification/gamification-tenant-collaboration.md)
- Customer App: [gamification/gamification-customer-app.md](gamification/gamification-customer-app.md)
- MVP Phases: [gamification/gamification-mvp.md](gamification/gamification-mvp.md)

### Platform Infrastructure
- Multi-Tenant: [platform/multi-tenant-support.md](platform/multi-tenant-support.md)
- Notifications: [platform/notification-infrastructure.md](platform/notification-infrastructure.md)
- Promos: [platform/time-bound-promos.md](platform/time-bound-promos.md)
- Economics: [platform/reward-monetary-values.md](platform/reward-monetary-values.md)
- API: [platform/public-api.md](platform/public-api.md)
- E-commerce: [platform/ecommerce-plugins.md](platform/ecommerce-plugins.md)
- Theming: [platform/configurable-themes.md](platform/configurable-themes.md)
- Growth: [platform/growth-branding.md](platform/growth-branding.md)
- Acquisition: [platform/tenant-acquisition-incentives.md](platform/tenant-acquisition-incentives.md)
- Visual Experience: [platform/visual-experience-engine.md](platform/visual-experience-engine.md)
- CI/CD: [platform/ci-cd-pipeline.md](platform/ci-cd-pipeline.md)

### Core Documentation
- Architecture: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Rules Engine: [../RULES_ENGINE.md](../RULES_ENGINE.md)
- Entitlements: [../ENTITLEMENTS.md](../ENTITLEMENTS.md)
- Database: [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)
- Gamification Theme: [../GAMIFICATION.md](../GAMIFICATION.md)

---

*This document is the single source of truth for implementation sequencing. Update it when adding new features or changing priorities.*
