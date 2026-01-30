# Gamification: Crews & Social Features

> **Status:** 🔷 Specified  
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)  
> **Last Updated:** January 30, 2026

---

## Overview

Crews are the social layer of RewardsPirate. Players form teams to compete on leaderboards, collaborate on challenges, and build community around their favorite locations.

---

## Core Concept

**Crews are player-formed teams** that:
- Compete on leaderboards (XP, captures, visits)
- Collaborate on crew challenges
- Share achievements and progress
- Create social accountability for visits

---

## Crew Structure

### Crew Basics

| Attribute | Value |
|-----------|-------|
| Min size | 1 (founder) |
| Max size | 50 members |
| Name | Unique, 3-30 characters |
| Tag | 2-5 characters |
| Creation cost | Boatswain rank (1,500 XP) |

### Crew Roles

| Role | Permissions | Limit |
|------|-------------|-------|
| Captain | All permissions | 1 |
| First Mate | Invite, kick, edit | Up to 3 |
| Boatswain | Invite members | Up to 5 |
| Crew Member | Participate, chat | Unlimited |

---

## Crew Leaderboards

| Leaderboard | Metric | Timeframe |
|-------------|--------|-----------||
| XP | Total crew XP | Weekly, Monthly, All-time |
| Captures | Creatures captured | Weekly, Monthly |
| Visits | Check-ins completed | Weekly, Monthly |
| Voyages | Quests completed | Monthly, All-time |

---

## Crew Challenges

| Type | Description |
|------|-------------|
| Crew Voyage | Collective goals ("Visit 100 locations") |
| Crew Raid | Participate in raids together |
| Crew vs Crew | Direct competition |

---

## Crew Chat

Features:
- Text messages
- Auto-posted activity feed
- @mentions
- Emoji reactions

---

## Database Schema

```sql
CREATE TABLE crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    tag VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    captain_id UUID NOT NULL REFERENCES users(id),
    join_policy VARCHAR(50) DEFAULT 'approval',
    member_count INTEGER DEFAULT 1,
    total_xp BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES crews(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    xp_contributed BIGINT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE crew_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES crews(id),
    user_id UUID REFERENCES users(id),
    message_type VARCHAR(50) DEFAULT 'text',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/crews` | POST | Create crew |
| `/crews/:id` | GET | Get crew details |
| `/crews/:id/join` | POST | Request to join |
| `/crews/leaderboard` | GET | Get leaderboards |
| `/crews/:id/messages` | GET/POST | Chat |

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-events-raids.md](gamification-events-raids.md) - Crew raid participation
- [gamification-data-model.md](gamification-data-model.md) - Complete schema

---

*Last updated: January 30, 2026*
