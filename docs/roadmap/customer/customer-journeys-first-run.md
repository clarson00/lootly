# Customer Journey: First Run Experience

> **Status:** 🔷 Specified
> **Priority:** High - First 60 seconds determine retention
> **Category:** Customer Experience

---

## Dependencies

- **Requires:**
  - Customer app
  - SMS verification service (Twilio)
  - Push notification infrastructure

- **Enables:**
  - Customer identity (phone = ID)
  - Notification delivery
  - All other customer features

---

## Roadmap Position

- **Tier:** 1 (MVP)
- **Phase:** MVP
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Customer Journeys - Quest Management](./customer-journeys-quest-management.md)
  - [Customer Journeys - Discovery](./customer-journeys-discovery.md)
  - [Notifications Digest](./notifications-digest.md)

---

## Overview

Minimal onboarding that collects phone number, sets notification preferences, then gets out of the way. Total: 4 screens, under 60 seconds.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │    │              │
│    Phone     │───►│   Verify     │───►│ Notification │───►│   Discover   │
│    Number    │    │    Code      │    │ Preferences  │    │   Screen     │
│              │    │              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     10 sec              5 sec              10 sec             Done!
```

### Design Principles

1. **Minimal friction** - Only ask what's essential
2. **Set expectations** - Tell them what's coming next
3. **User control** - They choose notifications, not us
4. **No tutorial** - Learn by doing, contextual hints later
5. **Quick to value** - Get to Discover screen fast

---

## Screen 1: Phone Number

The only required input. Phone number = identity.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                              🏴‍☠️                                   │
│                                                                     │
│                       REWARDS PIRATE                                │
│                                                                     │
│               Earn treasure at local businesses                     │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         Your phone number is your pirate ID                        │
│         for all treasure and game events                           │
│                                                                     │
│         ┌─────────────────────────────────────────────────────┐    │
│         │  🇺🇸 +1  │  (555) 123-4567                          │    │
│         └─────────────────────────────────────────────────────┘    │
│                                                                     │
│                        [Send Code]                                  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         🔔 Next, you'll choose your notification preferences.      │
│            We don't spam - you're in control.                      │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         By continuing, you agree to our Terms of Service           │
│         and Privacy Policy.                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Behavior

| Element | Behavior |
|---------|----------|
| **Country picker** | Auto-detect from locale, tap to change |
| **Phone input** | Numeric keyboard, auto-format as they type |
| **Send Code button** | Disabled until valid number entered |
| **Notification note** | Sets expectation, reduces phone number anxiety |
| **Legal links** | Open in modal/webview |

### Phone Input Details

```typescript
// Auto-format as user types
"5551234567" → "(555) 123-4567"

// Validate before enabling button
function isValidPhone(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}
```

### Country Code Picker

```
┌─────────────────────────────────────────────────────────────────────┐
│ Select Country                                             [Cancel] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [Search countries...]                                              │
│                                                                     │
│ 🇺🇸 United States (+1)                                    ✓        │
│ 🇨🇦 Canada (+1)                                                     │
│ 🇬🇧 United Kingdom (+44)                                            │
│ 🇦🇺 Australia (+61)                                                 │
│ 🇩🇪 Germany (+49)                                                   │
│ 🇫🇷 France (+33)                                                    │
│ ...                                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 2: Verify Code

SMS verification with auto-fill support.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ← Back                                                             │
│                                                                     │
│                              🏴‍☠️                                   │
│                                                                     │
│                    Enter your code                                  │
│                                                                     │
│              We sent a code to (555) 123-4567                      │
│                                                                     │
│                                                                     │
│                   ┌───┐ ┌───┐ ┌───┐ ┌───┐                         │
│                   │ 1 │ │ 2 │ │ 3 │ │ 4 │                         │
│                   └───┘ └───┘ └───┘ └───┘                         │
│                                                                     │
│                                                                     │
│              ┌─────────────────────────────────┐                   │
│              │ From Messages: Use code 1234    │ ← Auto-fill      │
│              └─────────────────────────────────┘                   │
│                                                                     │
│                                                                     │
│                   Didn't get a code?                               │
│                   [Resend] (available in 30s)                      │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Behavior

| Element | Behavior |
|---------|----------|
| **Code input** | 4 digits, auto-advance between boxes |
| **Auto-fill** | iOS/Android detect SMS, offer to fill |
| **Auto-submit** | When 4 digits entered, auto-verify |
| **Resend** | Disabled for 30s, then available |
| **Back** | Return to phone number screen |

### SMS Message Format

```
Your Rewards Pirate code is 1234

(For SMS auto-fill on Android, include app hash)
```

### Error States

```
INVALID CODE:
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │  ← Boxes shake, turn red
└───┘ └───┘ └───┘ └───┘

That code didn't work. Try again or resend.
```

```
TOO MANY ATTEMPTS:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ⚠️ Too many attempts                                               │
│                                                                     │
│  Please wait 5 minutes before trying again,                        │
│  or contact support if you need help.                              │
│                                                                     │
│                    [Contact Support]                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Notification Preferences

User chooses what notifications they want. Smart defaults pre-selected.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         🔔                                         │
│                                                                     │
│                  Stay in the Loop                                  │
│                                                                     │
│      We'll keep notifications minimal and useful.                  │
│      You can change these anytime in Settings.                     │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [✓] Rewards & Achievements              ⭐ RECOMMENDED    │   │
│  │                                                             │   │
│  │      When you earn rewards, unlock treasure,               │   │
│  │      or complete quests                                    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [✓] Quest Alerts                        ⭐ RECOMMENDED    │   │
│  │                                                             │   │
│  │      Streak warnings before they break,                    │   │
│  │      nearby alerts for quests you're chasing               │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [ ] Promotions & Deals                                    │   │
│  │                                                             │   │
│  │      Special offers and bonus events from                  │   │
│  │      businesses you visit                                  │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                       [Continue]                                   │
│                                                                     │
│                     [Skip for now]                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Notification Categories Explained

| Category | Default | What It Includes |
|----------|---------|------------------|
| **Rewards & Achievements** | ✓ ON | Reward earned, reward unlocked, badge earned, level up, voyage complete |
| **Quest Alerts** | ✓ ON | Streak about to break, nearby your active quests, progress milestones |
| **Promotions & Deals** | OFF | 2X point days, special offers, new rewards available, marketing |

### Behavior

| Action | Result |
|--------|--------|
| **Toggle checkbox** | Flip preference on/off |
| **Continue** | Save preferences, request OS permission if any ON |
| **Skip for now** | All set to OFF, go to Discover |

### If All Toggled OFF

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Are you sure?                                                     │
│                                                                     │
│  Without notifications, you might miss:                            │
│  • When you earn rewards                                           │
│  • Streak warnings before they break                               │
│  • Being near a quest location                                     │
│                                                                     │
│  You can always enable them later in Settings.                     │
│                                                                     │
│         [Enable Recommended]     [Continue without]                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3b: OS Permission Request

If any notifications enabled, OS shows permission dialog.

### iOS

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│      "Rewards Pirate" Would Like to                                │
│      Send You Notifications                                        │
│                                                                     │
│      Notifications may include alerts,                             │
│      sounds, and icon badges.                                      │
│                                                                     │
│              [Don't Allow]     [Allow]                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Android 13+

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│      Allow Rewards Pirate to                                       │
│      send you notifications?                                       │
│                                                                     │
│              [Don't allow]     [Allow]                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### If Permission Denied

Don't block them - just note it and continue:

```typescript
if (permissionDenied) {
  // Save that they wanted notifications but OS blocked
  savePreference({
    ...selectedPreferences,
    osPermissionDenied: true
  });

  // Continue to Discover - don't nag
  navigateToDiscover();
}
```

Later, we can show a subtle prompt if they try to enable per-quest notifications:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔔 Notifications are disabled                                      │
│                                                                     │
│ To get alerts for this quest, enable notifications                 │
│ in your device Settings.                                           │
│                                                                     │
│                    [Open Settings]     [Not now]                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Discover (Done!)

User lands on the main Discover screen. Onboarding complete.

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔍 Discover Treasure                              [Filter] [Map]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💡 Welcome aboard, pirate!                          [Got it]│   │
│  │                                                             │   │
│  │ Browse rewards below. Tap "+ Add to Quests"                │   │
│  │ to start chasing treasure!                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ 📍 NEAR YOU                                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🍕 Tony's Downtown                                    0.5 mi   │ │
│ │ Earn 500 pts → FREE Appetizer                                  │ │
│ │ 💰 ~$12 value                            [+ Add to Quests]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ...                                                                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [🔍 Discover]    [🗺️ My Quests]    [🎁 Rewards]    [👤 Profile]  │
└─────────────────────────────────────────────────────────────────────┘
```

### First-Time Tooltip

One-time contextual hint. Dismisses on tap and never shows again.

---

## Returning User Flow

If phone number already exists in system:

```
Phone entered → Code sent → Code verified
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Welcome back!       │
                    │                     │
                    │ Your treasure and   │
                    │ quests are restored │
                    │                     │
                    │    [Continue]       │
                    └─────────────────────┘
                              │
                              ▼
                    [DISCOVER SCREEN]
                    (Skip notification setup - already have preferences)
```

No need to re-do notification preferences - they're saved.

---

## Deep Link Entry

If user opens app via deep link (e.g., from staff check-in SMS):

```
SMS: "Welcome to Rewards Pirate! You earned 50 pts at Tony's.
      Open app: rewardspirate.app/welcome?token=xyz"
                              │
                              ▼
App opens with token → Auto-verify phone (no code needed)
                              │
                              ▼
                    [NOTIFICATION PREFERENCES]
                              │
                              ▼
                    [DISCOVER SCREEN]
                    (With toast: "50 pts earned at Tony's!")
```

Skips phone entry and verification since staff already collected/verified.

---

## Analytics Events

Track onboarding funnel:

| Event | When |
|-------|------|
| `onboarding_started` | App opened first time |
| `phone_entered` | Tapped Send Code |
| `code_sent` | SMS successfully sent |
| `code_verified` | Correct code entered |
| `code_failed` | Wrong code entered |
| `notifications_selected` | Preferences saved |
| `notifications_skipped` | Tapped Skip |
| `os_permission_granted` | Allowed notifications |
| `os_permission_denied` | Denied notifications |
| `onboarding_completed` | Reached Discover screen |

### Funnel Analysis

```
onboarding_started:     1000
phone_entered:           950  (95% - good)
code_verified:           920  (92% - normal SMS drop-off)
notifications_selected:  880  (88% - some skip)
onboarding_completed:    880  (88% - same, no drop after)
```

---

## Database Schema

```sql
-- Customer record (created on verification)
CREATE TABLE customers (
  id TEXT PRIMARY KEY,                 -- "cust_abc123"
  phone TEXT NOT NULL UNIQUE,          -- "+15551234567"
  phone_verified BOOLEAN DEFAULT true,

  -- Profile (optional, collected later)
  display_name TEXT,
  avatar_url TEXT,

  -- Notification preferences (set at onboarding)
  notify_rewards BOOLEAN DEFAULT true,
  notify_quest_alerts BOOLEAN DEFAULT true,
  notify_promotions BOOLEAN DEFAULT false,

  -- OS permission status
  push_token TEXT,                     -- FCM/APNS token
  push_permission_granted BOOLEAN,
  push_permission_asked_at TIMESTAMPTZ,

  -- Onboarding state
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification codes
CREATE TABLE verification_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,                  -- "1234"
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_phone ON verification_codes(phone, expires_at);
```

---

## API Endpoints

```typescript
// Send verification code
POST /api/auth/send-code
Body: { phone: "+15551234567" }
Response: { success: true, expiresIn: 300 }

// Verify code
POST /api/auth/verify-code
Body: { phone: "+15551234567", code: "1234" }
Response: {
  success: true,
  token: "jwt...",
  isNewUser: true,
  customer: { id: "cust_abc", phone: "..." }
}

// Save notification preferences
PUT /api/customer/notification-preferences
Headers: { Authorization: "Bearer jwt..." }
Body: {
  notifyRewards: true,
  notifyQuestAlerts: true,
  notifyPromotions: false
}
Response: { success: true }

// Register push token
POST /api/customer/push-token
Headers: { Authorization: "Bearer jwt..." }
Body: {
  token: "fcm_token...",
  platform: "ios" | "android"
}
Response: { success: true }
```

---

## Security Considerations

### Rate Limiting

```typescript
// Limit code requests per phone
const RATE_LIMITS = {
  codesPerPhone: { max: 5, windowMinutes: 60 },
  codesPerIP: { max: 20, windowMinutes: 60 },
  verifyAttempts: { max: 5, perCode: true }
};
```

### Code Expiration

- Codes expire after 5 minutes
- Only most recent code is valid
- Max 5 attempts per code

### Phone Validation

```typescript
// Block obviously fake numbers
const BLOCKED_PREFIXES = [
  '+1555',      // 555 numbers are fake
  '+1234',      // Sequential
];

// Validate format
function validatePhone(phone: string): boolean {
  // E.164 format, 10-15 digits
  return /^\+[1-9]\d{9,14}$/.test(phone);
}
```

---

## Implementation Checklist

### Phase 1: Core Flow
- [ ] Phone number screen with country picker
- [ ] SMS sending via Twilio
- [ ] Verification code screen with auto-fill
- [ ] Code validation with rate limiting
- [ ] JWT token generation on success
- [ ] Returning user detection

### Phase 2: Notifications
- [ ] Notification preferences screen
- [ ] OS permission request handling
- [ ] Push token registration
- [ ] Preference storage

### Phase 3: Polish
- [ ] Deep link handling (staff-initiated)
- [ ] Analytics events
- [ ] Error states and edge cases
- [ ] Contextual first-time tooltip

---

## Timing Estimate

| Screen | Typical Time |
|--------|--------------|
| Phone number entry | 5-10 seconds |
| Wait for SMS | 2-5 seconds |
| Enter/auto-fill code | 2-5 seconds |
| Notification preferences | 5-10 seconds |
| **Total** | **15-30 seconds** |

Fast, respectful, gets them to value quickly.

---

*Last updated: January 2025*
