import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// Mock data for demo - replace with API calls
const MOCK_OPPORTUNITIES = [
  {
    id: 'opp_1',
    businessId: 'biz_pilot',
    businessName: "Tony's Downtown",
    businessIcon: '🍕',
    category: 'Restaurant',
    distance: '0.5 mi',
    featuredReward: {
      name: 'Free Appetizer',
      pointsRequired: 500,
      estimatedValue: '$12'
    },
    activeVoyage: {
      name: 'Grand Tour',
      description: 'Visit all 4 locations'
    },
    pointsPerDollar: 1,
    memberCount: 234
  },
  {
    id: 'opp_2',
    businessId: 'biz_coffee',
    businessName: "Harbor Coffee Co",
    businessIcon: '☕',
    category: 'Coffee Shop',
    distance: '0.8 mi',
    featuredReward: {
      name: 'Free Drink',
      pointsRequired: 100,
      estimatedValue: '$6'
    },
    activeVoyage: null,
    pointsPerDollar: 2,
    memberCount: 89
  },
  {
    id: 'opp_3',
    businessId: 'biz_brewery',
    businessName: "Pirate's Cove Brewing",
    businessIcon: '🍺',
    category: 'Brewery',
    distance: '1.2 mi',
    featuredReward: {
      name: 'Free Pint',
      pointsRequired: 200,
      estimatedValue: '$8'
    },
    activeVoyage: {
      name: 'Tap Takeover',
      description: 'Try 5 different brews'
    },
    pointsPerDollar: 1,
    memberCount: 156
  },
  {
    id: 'opp_4',
    businessId: 'biz_salon',
    businessName: "The Captain's Chair",
    businessIcon: '💈',
    category: 'Salon',
    distance: '2.1 mi',
    featuredReward: {
      name: 'Free Haircut',
      pointsRequired: 500,
      estimatedValue: '$35'
    },
    activeVoyage: null,
    pointsPerDollar: 1,
    memberCount: 67
  }
];

function OpportunityCard({ opportunity, onAddToQuests }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    onAddToQuests(opportunity);
    // Brief animation then reset
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-dark-light rounded-2xl p-4 border border-gray-800 hover:border-primary/30 transition-all card-glow tap-scale">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            {opportunity.businessIcon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{opportunity.businessName}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {opportunity.category} • {opportunity.distance}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">{opportunity.memberCount}</span>
          <p className="text-xs text-gray-600">crew</p>
        </div>
      </div>

      {/* Featured Reward */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent rounded-xl p-3 mb-3 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-primary/70 mb-1 font-medium">🎯 Featured Treasure</p>
            <p className="font-bold text-white text-lg">{opportunity.featuredReward.name}</p>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <span className="text-primary font-semibold">{opportunity.featuredReward.pointsRequired} 🪙</span>
              <span>•</span>
              <span className="text-green-400">~{opportunity.featuredReward.estimatedValue} value</span>
            </p>
          </div>
          <div className="text-4xl treasure-bounce">💎</div>
        </div>
      </div>

      {/* Active Voyage */}
      {opportunity.activeVoyage && (
        <div className="bg-gradient-to-r from-secondary/15 to-transparent rounded-xl p-3 mb-3 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🗺️</span>
            <p className="text-xs text-secondary font-bold uppercase tracking-wide">Active Voyage</p>
          </div>
          <p className="text-sm text-white font-semibold">{opportunity.activeVoyage.name}</p>
          <p className="text-xs text-gray-400">{opportunity.activeVoyage.description}</p>
        </div>
      )}

      {/* Points rate + Add button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <p className="text-sm text-gray-400 flex items-center gap-1">
          Earn <span className="text-primary font-semibold">{opportunity.pointsPerDollar}x</span> 🪙 per $1
        </p>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all
            ${added
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 scale-105'
              : 'bg-gradient-to-r from-primary to-yellow-400 text-dark hover:from-yellow-400 hover:to-primary active:scale-95 shadow-lg shadow-primary/20'
            }`}
        >
          {added ? '✓ Added!' : '+ Add to Quests'}
        </button>
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const [filter, setFilter] = useState('all');
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(true);

  // Load added quest IDs from localStorage
  const [addedIds, setAddedIds] = useState(() => {
    const saved = localStorage.getItem('lootly_added_quests');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter out already-added opportunities
  const opportunities = MOCK_OPPORTUNITIES.filter(o => !addedIds.includes(o.id));

  const handleAddToQuests = (opportunity) => {
    // Save to localStorage for MyQuests to pick up
    const savedQuests = JSON.parse(localStorage.getItem('lootly_quests') || '[]');
    const newQuest = {
      id: opportunity.id,
      type: 'reward',
      businessName: opportunity.businessName,
      businessIcon: opportunity.businessIcon,
      targetName: opportunity.featuredReward.name,
      targetIcon: '💎',
      currentPoints: 0,
      requiredPoints: opportunity.featuredReward.pointsRequired,
      estimatedValue: opportunity.featuredReward.estimatedValue,
      notifyNearby: true,
      notifyProgress: true,
      lastActivity: 'Just added'
    };
    localStorage.setItem('lootly_quests', JSON.stringify([...savedQuests, newQuest]));

    // Track this ID as added
    const newAddedIds = [...addedIds, opportunity.id];
    localStorage.setItem('lootly_added_quests', JSON.stringify(newAddedIds));
    setAddedIds(newAddedIds);
  };

  const filteredOpportunities = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.category.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🔍</span>
            <span className="text-gold-gradient">Discover Treasure</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Find rewards near you</p>
        </div>
        <button
          className="w-12 h-12 bg-dark-light rounded-xl flex items-center justify-center text-2xl border border-gray-700 hover:border-primary/50 transition-colors"
          onClick={() => {/* TODO: Map view */}}
        >
          🗺️
        </button>
      </div>

      {/* First-time hint */}
      {showFirstTimeHint && (
        <div className="bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-2xl p-4 mb-6 border border-primary/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-20">🏴‍☠️</div>
          <button
            onClick={() => setShowFirstTimeHint(false)}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm"
          >
            ✕
          </button>
          <p className="text-base text-white mb-1 font-bold flex items-center gap-2">
            <span>💡</span> Welcome aboard, pirate!
          </p>
          <p className="text-sm text-gray-300">
            Browse rewards below. Tap <span className="text-primary font-semibold">"+ Add to Quests"</span> to start chasing treasure!
          </p>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 relative z-10">
        {['all', 'restaurant', 'coffee shop', 'brewery', 'salon'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-full text-sm whitespace-nowrap transition-all font-medium
              ${filter === f
                ? 'bg-gradient-to-r from-primary to-yellow-400 text-dark shadow-lg shadow-primary/20'
                : 'bg-dark-light text-gray-400 hover:text-white border border-gray-700'
              }`}
          >
            {f === 'all' ? '✨ All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Section: Near You */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📍</span> Near You
          </h2>
          <button className="text-primary text-sm">View Map →</button>
        </div>

        <div className="space-y-4">
          {filteredOpportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onAddToQuests={handleAddToQuests}
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏝️</div>
          <p className="text-gray-400">No treasure found nearby...</p>
          <p className="text-gray-500 text-sm">Try a different filter or expand your search</p>
        </div>
      )}
    </div>
  );
}
