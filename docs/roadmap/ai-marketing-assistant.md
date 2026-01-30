# AI Marketing Assistant

> **Status:** 💡 Idea  
> **Target Release:** v2.0+  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: LATER  
> **Location:** `docs/roadmap/ai-marketing-assistant.md`  

## Overview

An AI-powered assistant that helps business owners create effective marketing campaigns, design reward structures, and optimize their loyalty program. Acts as a virtual marketing consultant available 24/7.

## Core Capabilities

### 1. Campaign Creation Assistant

Helps owners create marketing messages and promotions:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Marketing Assistant                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Owner: "I want to run a promotion for Valentine's Day"  │
│                                                         │
│ AI: "Great idea! Here are some options:                 │
│                                                         │
│   💕 'Date Night Double Points'                         │
│   Couples earn 2x points on Feb 14th                    │
│   Estimated cost: ~$200 in extra rewards                │
│   Expected lift: 25-40% more visits                     │
│                                                         │
│   🍷 'Bring Your Valentine' Bonus                       │
│   50 bonus points when 2+ people check in together      │
│   Estimated cost: ~$150 in rewards                      │
│   Expected lift: 30% more group visits                  │
│                                                         │
│   Which sounds better, or want me to suggest more?"     │
│                                                         │
│ [Use first option] [Use second] [More ideas]            │
└─────────────────────────────────────────────────────────┘
```

### 2. Points & Rewards Guidance

Helps owners understand the economics:

```
Owner: "Is 1 point per dollar the right amount?"

AI: "Based on your setup:

   Current: 1 point per $1, rewards at 100-200 points
   
   This means customers get:
   • Free drink ($3 value) after spending $50
   • Free appetizer ($10 value) after spending $100
   • $10 off after spending $200
   
   Your effective discount rate: 5-6%
   Industry average: 5-10%
   
   ✅ You're in a healthy range!
   
   Want me to model what happens if you increase to 
   1.5 points per dollar?"
```

### 3. Journey Builder Assistant

Helps design effective multi-step journeys:

```
Owner: "I want customers to try all my restaurants"

AI: "Perfect for a Grand Tour journey! Based on your data:

   📊 Current cross-visit rate: 23%
   (Most customers only visit 1 of your 4 locations)
   
   Suggested journey:
   
   🗺️ 'Freddie's Grand Tour'
   • Visit all 4 locations within 60 days
   • Reward: $25 off + 2x points for 30 days
   
   Projected impact:
   • 15% of active customers will attempt
   • 60% completion rate
   • Cross-visit rate increase to 35%
   • Estimated program cost: $400/month
   • Estimated revenue lift: $2,000/month
   
   [Create this journey] [Adjust parameters] [Different idea]"
```

### 4. Performance Insights & Recommendations

Proactively suggests optimizations:

```
┌─────────────────────────────────────────────────────────┐
│ 💡 Weekly Insights from your AI Assistant               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📈 What's Working:                                      │
│ • "Taco Tuesday 2x Points" drove 34% more visits        │
│ • Weekend Warrior journey has 72% completion rate       │
│                                                         │
│ ⚠️ Needs Attention:                                     │
│ • 45 customers haven't visited in 60+ days              │
│ • El Rancho has lowest repeat visit rate (18%)         │
│                                                         │
│ 💡 Suggestions:                                         │
│ • Send win-back campaign to inactive customers          │
│   [Create Campaign]                                     │
│ • Try an El Rancho-specific bonus to boost visits       │
│   [See Ideas]                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### API Integration

```typescript
// AI service interface
interface MarketingAI {
  // Generate campaign ideas
  suggestCampaigns(context: BusinessContext): Promise<CampaignSuggestion[]>;
  
  // Analyze reward economics
  analyzeRewardStructure(business: Business): Promise<RewardAnalysis>;
  
  // Generate marketing copy
  generateCopy(prompt: string, style: CopyStyle): Promise<MarketingCopy>;
  
  // Get optimization suggestions
  getInsights(businessId: string): Promise<Insight[]>;
  
  // Answer owner questions
  chat(message: string, context: ConversationContext): Promise<AIResponse>;
}
```

### Context Provided to AI

The AI needs access to:

```typescript
interface BusinessContext {
  business: Business;
  locations: Location[];
  
  // Current program setup
  activeRules: Rule[];
  activeRewards: Reward[];
  activeJourneys: Journey[];
  
  // Performance metrics
  metrics: {
    totalCustomers: number;
    activeCustomers30d: number;
    averageVisitFrequency: number;
    averageSpend: number;
    redemptionRate: number;
    pointsLiability: number;
  };
  
  // Historical performance
  campaignPerformance: CampaignResult[];
  journeyPerformance: JourneyResult[];
  
  // Industry benchmarks
  benchmarks: IndustryBenchmarks;
}
```

### AI Provider Options

| Provider | Pros | Cons |
|----------|------|------|
| Claude API | Best reasoning, safe | Cost |
| OpenAI GPT-4 | Good, well-known | Cost |
| Fine-tuned smaller model | Cheaper at scale | Upfront work |
| Hybrid | Best of both | Complexity |

**Recommendation:** Start with Claude API for quality, consider fine-tuning later for cost optimization.

## User Experience

### Access Points

1. **Chat widget** in admin dashboard
2. **Inline suggestions** when creating campaigns/rules
3. **Weekly digest email** with insights
4. **Proactive notifications** for opportunities

### Conversation Memory

AI remembers context within session and key facts across sessions:
- Business goals mentioned
- Previous campaigns run
- Owner preferences ("I prefer simple promotions")

## Data Requirements

To make good recommendations, the AI needs:

1. **Transaction history** - What's been purchased, when, where
2. **Campaign results** - Which promotions drove results
3. **Journey completion data** - What journeys work
4. **Customer segments** - Who responds to what
5. **Industry benchmarks** - What's "normal"

## Guardrails

### Cost Protection
- Warn before suggesting expensive promotions
- Show estimated program cost for all suggestions
- Flag if suggestion would exceed budget thresholds

### Quality Control
- All AI-generated copy can be edited before use
- Suggestions are recommendations, not auto-applied
- Human approval required for all campaigns

### Scope Limits
- AI helps with marketing, not financial/legal advice
- Clear disclaimers on projections ("estimates based on similar businesses")
- Owner always has final say

## MVP vs Full Version

### MVP
- Basic chat for campaign ideas
- Pre-built prompt templates
- Simple copy generation
- Manual metrics input

### Full Version
- Full conversational assistant
- Automatic performance analysis
- Proactive recommendations
- A/B test suggestions
- Competitor benchmarking
- Multi-language support

## Success Metrics

| Metric | Target |
|--------|--------|
| AI feature adoption | 60% of owners use monthly |
| Suggestion acceptance rate | 40% of suggestions used |
| Campaign performance | AI-suggested campaigns outperform by 20% |
| Owner satisfaction | NPS > 50 for AI features |

## Related Features

- [Analytics & Reporting](analytics-reporting.md) — Data that feeds the AI
- [Marketing Messages](marketing-messages.md) — What AI helps create
- [User Journeys](user-journeys.md) — AI-assisted journey design
- [Time-Bound Promos](time-bound-promos.md) — AI-suggested promotions

---

← Back to [ROADMAP.md](../../ROADMAP.md)
