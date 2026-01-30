# AI Marketing Assistant

> **Status:** 💡 Idea  
> **Target Release:** v2.0+  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: LATER  
> **Location:** `docs/roadmap/ai-marketing-assistant.md`  

## Overview

An AI-powered assistant that helps business owners create effective marketing campaigns, optimize their loyalty program, and make data-driven decisions. Think of it as a fractional marketing director that knows loyalty programs.

## Why This Matters

Small business owners:
- Don't have marketing expertise
- Don't have time to analyze data
- Don't know what "good" looks like
- Need guidance on points economics
- Want to know what's working

The AI assistant bridges this gap by providing personalized, data-driven recommendations.

## Capabilities

### 1. Campaign Creation Assistant

Help owners create effective promotions and messages.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖 Marketing Assistant                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Owner: "I want to run a promotion this weekend"                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Great! Based on your data, weekends typically see 40%    │ │
│ │ more traffic. Here are some options:                        │ │
│ │                                                             │ │
│ │ 1. **Double Points Weekend** (Recommended)                  │ │
│ │    Your best-performing promo type. Est. cost: ~$180 in     │ │
│ │    extra points, but historically drives +$800 revenue.     │ │
│ │                                                             │ │
│ │ 2. **Visit 2 Locations Bonus**                              │ │
│ │    Drives cross-location traffic. Works well for you since  │ │
│ │    El Rancho is underperforming.                           │ │
│ │                                                             │ │
│ │ 3. **Bring a Friend Bonus**                                 │ │
│ │    Good for growth. 50 bonus points when you bring someone  │ │
│ │    who signs up.                                            │ │
│ │                                                             │ │
│ │ Which sounds good? I can set it up for you.                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Option 1] [Option 2] [Option 3] [Something else...]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Points Economics Advisor

Help owners understand the cost/value of their points system.

```
🤖 Points Health Check

"Your current setup: 1 point per $1, 100 points = $10 reward

This means you're giving back 10% in rewards. Industry average 
for restaurants is 5-8%. 

Options to consider:
• Reduce to 1 point per $1.50 spent (6.7% giveback)
• Keep earning the same but require 150 points for $10 (6.7%)
• Keep current rates but add expiration (reduces liability)

Your points liability is currently $2,340. That's healthy for 
your size, but watch if it grows past $5,000."
```

### 3. Proactive Insights

Push insights to owners without them asking.

```
🤖 Weekly Digest - Freddie's Restaurant Group

📈 What's Working:
• Grand Tour journey completions up 23% after you added the 
  mid-journey reminder
• Tuesday visits up 34% since starting Taco Tuesday promo

⚠️ Needs Attention:
• El Rancho visits down 15% vs last month
• 47 customers haven't visited in 60+ days (churn risk)

💡 Suggestions:
• Run a "We Miss You" campaign to at-risk customers (I can draft it)
• Consider an El Rancho-specific bonus to boost traffic there
• Your Grand Tour has 89 people stuck on Step 3 - a push might help

[Create "We Miss You" Campaign] [Boost El Rancho] [Nudge Grand Tour]
```

### 4. Message Writing Assistant

Help write compelling push notifications and messages.

```
Owner: "Write a push notification for double points this weekend"

🤖 Here are 3 options:

1. "🔥 This weekend only: DOUBLE POINTS on every visit! 
    Sat & Sun at all locations."
    
2. "2X the points, 2 days only! Visit any location this 
    Sat or Sun and earn double. Don't miss out!"
    
3. "Weekend bonus alert! Every dollar = 2 points this 
    Sat & Sun. Your reward is closer than you think 🎯"

Based on your past campaigns, short + emoji performs best. 
I recommend #1.

[Use #1] [Use #2] [Use #3] [Edit...]
```

### 5. Journey Optimization

Help design and improve customer journeys.

```
🤖 Journey Analysis: Grand Tour

"I noticed 30% of customers drop off between Step 2 and Step 3 
(the El Rancho visit). This is your biggest leak.

Ideas to fix it:

1. Add a step reward: Give 25 bonus points for completing 
   Step 3 (in addition to the final reward)
   
2. Extend the time limit: Currently 30 days. Some customers 
   might need more time. Try 45 days.
   
3. Send a nudge: When someone completes Step 2, auto-send 
   a push about El Rancho the next day.

4. Reorder steps: Put the harder location earlier when 
   motivation is highest.

Want me to implement any of these?"
```

### 6. Competitive Benchmarking (Future)

Anonymized comparisons to similar businesses.

```
🤖 How You Compare (vs similar restaurant groups)

                    You     Avg     Top 10%
Redemption Rate     78%     62%     85%      ✓ Great!
Avg Visit Frequency 2.1/mo  1.8/mo  3.2/mo   ↗ Room to grow
Points Liability    $2.3k   $4.1k   $1.8k    ✓ Healthy
Journey Completion  33%     28%     52%      ↗ Optimize
```

## Technical Implementation

### AI Provider

Use Claude API (Anthropic) for:
- Natural language understanding
- Recommendation generation  
- Message writing
- Data analysis narrative

### Context Window

Each AI request includes:
```json
{
  "business_profile": {
    "name": "Freddie's Restaurant Group",
    "locations": 4,
    "type": "restaurant",
    "enrolled_customers": 2341,
    "avg_monthly_visits": 1847
  },
  "recent_performance": {
    "visits_trend": "+8%",
    "top_reward": "Free Appetizer",
    "underperforming_location": "El Rancho"
  },
  "active_campaigns": [...],
  "user_question": "I want to run a promotion this weekend"
}
```

### Guardrails

- Don't recommend giving away too much (cap suggestions at 15% giveback)
- Always show cost estimates for promotions
- Flag if points liability is getting high
- Require confirmation before creating campaigns
- Rate limit API calls per business

### Data Privacy

- AI never sees individual customer PII
- Only aggregated/anonymized metrics
- Business owners control AI access
- Can disable AI features entirely

## User Interface

### Chat Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖 Lootly Assistant                                      ✕     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Hi Freddie! I noticed El Rancho traffic is down 15%      │ │
│ │ this month. Want me to suggest some ways to boost it?       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Yes, what do you recommend?                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Here are 3 ideas ranked by predicted impact...           │ │
│ │ [continued response]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Type a message...]                              [Send]         │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Actions

AI can take actions with owner approval:
- Create a promotion
- Draft a push notification
- Modify journey settings
- Generate a report

## Implementation Phases

### MVP (v2.0)
- Message writing assistant
- Basic promo recommendations
- Points economics calculator
- Chat interface

### v2.5
- Proactive weekly insights
- Journey optimization suggestions
- "Create for me" actions
- Campaign A/B test suggestions

### v3.0
- Predictive analytics (churn, LTV)
- Automated campaigns (with approval)
- Competitive benchmarking
- Multi-channel optimization

## Pricing Consideration

AI features could be:
- Included in Pro tier (limited queries)
- Add-on ($X/month for unlimited)
- Per-query pricing
- Enterprise only

Start with Pro tier inclusion to drive upgrades.

## API Costs

Estimated Claude API costs:
- ~$0.01-0.05 per conversation turn
- ~100-500 queries/business/month
- ~$5-25/business/month at scale

Price into subscription tiers.

## Related Features

- [Analytics & Reporting](analytics-reporting.md) — Data source for AI
- [Marketing Messages](marketing-messages.md) — AI writes these
- [Time-Bound Promos](time-bound-promos.md) — AI suggests these
- [User Journeys](user-journeys.md) — AI optimizes these

---

← Back to [ROADMAP.md](../../ROADMAP.md)
