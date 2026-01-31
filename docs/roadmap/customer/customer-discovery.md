# Customer Discovery

> **Status:** Planning
> **Priority:** Medium (Tier 4 - Gamification)
> **Category:** Customer

---

## Overview

Enable customers to discover and explore businesses on the Rewards Pirate platform, even before enrolling. This includes location-based search, rewards maps, business profiles, and seamless enrollment flows.

---

## Dependencies

- **Requires:**
  - Multi-tenant support (platform-wide customer identity)
  - Business public profiles (name, logo, category)

- **Enables:**
  - Platform growth (new business discovery)
  - Customer acquisition for businesses
  - Location-based features
  - Rewards map

---

## Roadmap Position

- **Tier:** 4 (Gamification)
- **Phase:** v2.0
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Multi-Tenant Support](../platform/multi-tenant-support.md)
  - [Customer Web Dashboard](./customer-web-dashboard.md)
  - [User Journeys](./user-journeys.md)

---

## Discovery Methods

### 1. Location-Based (Nearby)

**Default experience:**
- Show businesses within X miles of current location
- Sorted by distance
- Respects user's location privacy settings

**Handling sparse areas:**
- If < 3 businesses within 10 miles, expand radius
- Show "Nearest businesses" instead of "Nearby"
- Encourage: "Know a business that should join?"

### 2. Search

- Search by business name
- Search by category (restaurant, coffee, retail)
- Search by location/city

### 3. Browse Categories

- Restaurants & Dining
- Coffee & Cafes
- Retail & Shopping
- Health & Wellness
- Entertainment
- Services

### 4. Rewards Map

Interactive map showing:
- Business locations as pins
- Color-coded by category
- Tap pin → business preview card
- "Explore this area" when panning

### 5. Favorites

- Save businesses for later
- "Want to try" list
- Quick access regardless of location

---

## Location Privacy Settings

**Options:**

| Setting | Behavior |
|---------|----------|
| **On-demand** | Ask for location only when user requests nearby |
| **While using** | Use location while app is open |
| **Set home manually** | User enters zip code or address |
| **Off** | No location features, browse/search only |

**Default:** On-demand (least intrusive)

**Travel Detection (Optional):**
- Detect user is outside normal radius
- Prompt: "You're in [City]! Want to see rewards nearby?"
- User can dismiss or enable

---

## Business Profile (Pre-Enrollment)

What customers see before joining:

```
┌─────────────────────────────────────────────────────┐
│  🍕 Tony's Downtown                                 │
│  Italian Restaurant • 0.3 miles away               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💰 Earn 1 doubloon per $1 spent                   │
│                                                     │
│  🎁 Available Rewards:                              │
│  • Free Appetizer (500 pts)                        │
│  • 20% Off Entree (750 pts)                        │
│  • Free Dessert (300 pts)                          │
│                                                     │
│  🗺️ Active Voyages:                                │
│  • Weekend Warrior - Visit 3 weekends              │
│  • Pizza Party - Try 5 different pizzas            │
│                                                     │
│  📍 4 locations in Des Moines area                 │
│                                                     │
│  ⭐ 847 members earning rewards                     │
│                                                     │
│  [Join Now - It's Free!]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### What's Shown vs Hidden

| Shown | Hidden |
|-------|--------|
| Business name, logo, category | Exact point values of others |
| Available rewards & thresholds | Other customers' information |
| Active voyages (names only) | Internal promotions |
| Number of members (social proof) | Business analytics |
| Earning rate (pts per $) | |
| Location count | |

---

## Enrollment Flow

### From Discovery

1. User finds business in discovery
2. Taps "Join Now"
3. Already logged in → Instant enrollment
4. Not logged in → Sign up/login first → Then enroll
5. Redirect to business dashboard

### From First Visit (Check-In)

1. User checks in at new business
2. System detects no enrollment
3. Auto-enroll on first check-in
4. Welcome message: "Welcome to Tony's crew!"

### From QR Code

1. Business displays "Join our rewards" QR
2. User scans
3. Opens app/web → enrollment page
4. One-tap join

---

## Database Schema

```sql
-- Business public profile (tenant-controlled)
CREATE TABLE business_profiles (
  business_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT,                 -- 'restaurant', 'coffee', 'retail'
  description TEXT,
  website_url TEXT,
  earning_rate TEXT,             -- "1 point per $1"
  is_discoverable BOOLEAN DEFAULT TRUE,
  featured_rewards JSONB,        -- Array of reward previews
  featured_voyages JSONB,        -- Array of voyage previews
  member_count INT DEFAULT 0,    -- Cached count
  location_count INT DEFAULT 0,  -- Cached count
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business locations for map
CREATE TABLE business_locations_public (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_locations_geo ON business_locations_public(latitude, longitude);

-- Customer saved/favorite businesses
CREATE TABLE customer_saved_businesses (
  customer_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (customer_id, business_id)
);
```

---

## API Endpoints

```typescript
// Search/discover businesses
GET /api/discover/businesses
?lat=41.5868&lng=-93.6250  // Optional location
&radius=10                  // Miles
&category=restaurant
&q=pizza                    // Search term
&limit=20&offset=0

// Get business public profile
GET /api/discover/businesses/:businessId

// Get business locations (for map)
GET /api/discover/businesses/:businessId/locations

// Get all locations for map view
GET /api/discover/map
?lat=41.5868&lng=-93.6250
&radius=25

// Save/unsave business
POST /api/customer/saved-businesses/:businessId
DELETE /api/customer/saved-businesses/:businessId

// Get saved businesses
GET /api/customer/saved-businesses

// Enroll at business
POST /api/customer/enroll/:businessId
```

---

## UI Components

### Discovery Home

```
┌─────────────────────────────────────────────────────┐
│  🔍 Search businesses...                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📍 Nearby (Des Moines)                            │
│  ─────────────────────────────────────────────     │
│                                                     │
│  🍕 Tony's Downtown          0.3 mi    [Join]      │
│      Italian • 847 members                         │
│                                                     │
│  ☕ Coffee Co                 0.5 mi    [Join]      │
│      Coffee • 523 members                          │
│                                                     │
│  🍔 Burger Barn              1.2 mi    [Joined ✓]  │
│      American • 234 members                        │
│                                                     │
│  [🗺️ View Map]  [Browse Categories]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Rewards Map

```
┌─────────────────────────────────────────────────────┐
│  [← Back]  Rewards Map                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │    📍                     📍                │   │
│  │         📍         📍                       │   │
│  │                 📍                          │   │
│  │     📍                         📍           │   │
│  │              [You]                          │   │
│  │                      📍                     │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🍕 Tony's Downtown                          │   │
│  │ 0.3 mi • 847 members                        │   │
│  │ [View Profile]  [Get Directions]            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Basic Discovery
- [ ] Business public profiles table
- [ ] Business profile API
- [ ] Search by name/category
- [ ] Discovery list UI
- [ ] Business profile page
- [ ] Enrollment from discovery

### Phase 2: Location Features
- [ ] Geocoding for business locations
- [ ] Nearby businesses API
- [ ] Location permission flow
- [ ] Location settings UI

### Phase 3: Map View
- [ ] Map integration (Mapbox/Google Maps)
- [ ] Business pins on map
- [ ] Map interaction (tap, pan, zoom)
- [ ] Business preview cards on map

### Phase 4: Enhanced Discovery
- [ ] Favorites/saved businesses
- [ ] Travel detection (optional)
- [ ] Category browsing
- [ ] "Trending in your area"

---

## Business Controls (Tenant Side)

Businesses control their discovery presence:

```typescript
interface DiscoverySettings {
  isDiscoverable: boolean;       // Show in search/browse
  showMemberCount: boolean;      // Display social proof
  featuredRewards: string[];     // Which rewards to preview
  featuredVoyages: string[];     // Which voyages to preview
  customDescription: string;     // Marketing text
}
```

---

## Security Considerations

- Location data processed client-side when possible
- No tracking of user location history
- Rate limit discovery API
- Prevent scraping of business data
- Don't expose customer information in profiles

---

## Open Questions

1. **Map provider?** Mapbox (free tier) vs Google Maps (paid)?
2. **Category taxonomy?** Predefined list or freeform tags?
3. **Search ranking?** Distance only or include engagement metrics?
4. **Reviews?** Allow customer reviews of businesses?

---

*Last updated: January 2025*
