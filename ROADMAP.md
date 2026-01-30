# Lootly Product Roadmap

> **This file is maintained by Claude Code.** It tracks all future features, ideas, and enhancements.

## Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NOW (MVP)          │  NEXT (v1.1)        │  LATER (v2.0+)                  │
│  Pilot Launch       │  Post-Pilot         │  Scale & Expand                 │
├─────────────────────┼─────────────────────┼─────────────────────────────────┤
│ ✓ Phone auth        │ • Push notifications│ • White-label apps              │
│ ✓ QR check-in       │ • Admin dashboard   │ • POS integrations              │
│ ✓ Points tracking   │ • Visual rule builder│ • Receipt scanning             │
│ ✓ Basic rewards     │ • Multiple programs │ • Referral system               │
│ ✓ Staff tablet      │ • Analytics         │ • Gamification (badges, levels) │
│ ✓ Rules engine core │ • Product bonuses   │ • API for third parties         │
│ ✓ Milestone rewards │ • Expiring rewards  │ • Enterprise features           │
└─────────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 💡 Idea | Just an idea, not yet planned |
| 📋 Planned | On the roadmap, will be built |
| 🔷 Specified | Has detailed spec written |
| 🚧 In Progress | Currently being built |
| ✅ Complete | Done and shipped |
| ❌ Dropped | Decided not to build |

---

## NOW — MVP (Pilot Launch)

*Target: Get pilot customer live*

| Feature | Status | Spec | Notes |
|---------|--------|------|-------|
| Phone number auth | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#auth-routes) | SMS mock for MVP |
| Customer PWA | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#customer-app-pages) | |
| Staff tablet PWA | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#staff-app-pages) | |
| QR code generation | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#qr-code-specs) | |
| QR scanning | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#staff-app-pages) | |
| Points tracking | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#database-schema) | |
| Visit tracking | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#transaction-routes) | |
| Rules engine (core) | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#composable-rules-engine) | AND/OR logic |
| Basic rewards | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#rewards-routes) | |
| Milestone rewards | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#composable-rules-engine) | Grand Tour |
| Loot drop animation | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#customer-app-pages) | |
| Reward redemption | 🚧 In Progress | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#staff-app-pages) | |

---

## NEXT — v1.1 (Post-Pilot)

*Target: Production-ready for more businesses*

| Feature | Status | Spec | Notes |
|---------|--------|------|-------|
| Push notifications | 📋 Planned | [roadmap/push-notifications.md](docs/roadmap/push-notifications.md) | Reward earned, expiring |
| Admin dashboard | 📋 Planned | [roadmap/admin-dashboard.md](docs/roadmap/admin-dashboard.md) | Web-based |
| Visual rule builder | 📋 Planned | [roadmap/visual-rule-builder.md](docs/roadmap/visual-rule-builder.md) | Drag & drop |
| Multiple programs per user | 📋 Planned | — | Already architected |
| Basic analytics | 📋 Planned | [roadmap/analytics.md](docs/roadmap/analytics.md) | Sign-ups, redemptions |
| Product-based bonuses | 📋 Planned | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#composable-rules-engine) | Part of rules engine |
| Day of week rules | 📋 Planned | [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md#composable-rules-engine) | Taco Tuesday |
| Expiring rewards | 📋 Planned | — | |
| Real SMS verification | 📋 Planned | [roadmap/sms-integration.md](docs/roadmap/sms-integration.md) | Twilio |
| Subscription billing | 📋 Planned | [roadmap/billing.md](docs/roadmap/billing.md) | Stripe |

---

## LATER — v2.0+ (Scale & Expand)

*Target: Platform growth and enterprise features*

| Feature | Status | Spec | Notes |
|---------|--------|------|-------|
| White-label apps | 💡 Idea | [roadmap/white-label.md](docs/roadmap/white-label.md) | Custom branding per business |
| POS integrations | 💡 Idea | [roadmap/pos-integrations.md](docs/roadmap/pos-integrations.md) | Toast, Square, Clover |
| Receipt scanning | 💡 Idea | [roadmap/receipt-scanning.md](docs/roadmap/receipt-scanning.md) | OCR-based |
| Referral system | 💡 Idea | [roadmap/referrals.md](docs/roadmap/referrals.md) | Invite friends, earn points |
| Gamification | 💡 Idea | [roadmap/gamification.md](docs/roadmap/gamification.md) | Badges, levels, streaks |
| Public API | 💡 Idea | [roadmap/public-api.md](docs/roadmap/public-api.md) | Third-party integrations |
| Enterprise SSO | 💡 Idea | — | Large business needs |
| Multi-currency | 💡 Idea | — | International expansion |
| Offline mode | 💡 Idea | — | Works without internet |
| Staff mobile app | 💡 Idea | — | Phone instead of tablet |
| Customer segmentation | 💡 Idea | — | Target rewards by segment |
| A/B testing rules | 💡 Idea | — | Test which rewards work |
| Franchise support | 💡 Idea | — | Multi-owner hierarchy |

---

## Ideas Backlog

*Raw ideas not yet evaluated. Move to roadmap sections when prioritized.*

| Idea | Source | Date | Notes |
|------|--------|------|-------|
| | | | |

---

## Completed Features

*Moved here when shipped*

| Feature | Completed | Notes |
|---------|-----------|-------|
| | | |

---

## Dropped Features

*Ideas we decided not to pursue*

| Feature | Reason | Date |
|---------|--------|------|
| | | |

---

## How to Use This Roadmap

### Adding an Idea
1. Add to "Ideas Backlog" with source and date
2. Discuss and evaluate
3. If approved, move to appropriate section (NEXT or LATER)

### Specifying a Feature
1. Create detailed spec in `docs/roadmap/feature-name.md`
2. Update status to 🔷 Specified
3. Link spec in the Spec column

### Starting Work
1. Update status to 🚧 In Progress
2. Add to PROGRESS.md
3. Build it

### Completing
1. Update status to ✅ Complete
2. Move to "Completed Features" section
3. Note completion date

---

## Links

- [Business Scope](docs/SCOPE.md)
- [Technical Spec](docs/TECHNICAL_SPEC.md)
- [Architecture Guidelines](docs/ARCHITECTURE.md)
- [Progress Tracker](PROGRESS.md)

---

*Last updated: [Date]*
