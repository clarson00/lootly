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
    <div className="bg-dark-light rounded-2xl p-4 border border-gray-800 hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
            {opportunity.businessIcon}
          </div>
          <div>
            <h3 className="font-bold text-white">{opportunity.businessName}</h3>
            <p className="text-gray-500 text-sm">{opportunity.category} • {opportunity.distance}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{opportunity.memberCount} crew</span>
      </div>

      {/* Featured Reward */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Featured Treasure</p>
            <p className="font-semibold text-white">{opportunity.featuredReward.name}</p>
            <p className="text-xs text-gray-400">
              {opportunity.featuredReward.pointsRequired} 🪙 • ~{opportunity.featuredReward.estimatedValue} value
            </p>
          </div>
          <div className="text-3xl">💎</div>
        </div>
      </div>

      {/* Active Voyage */}
      {opportunity.activeVoyage && (
        <div className="bg-secondary/10 rounded-xl p-3 mb-3 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🗺️</span>
            <p className="text-xs text-secondary font-semibold">Active Voyage</p>
          </div>
          <p className="text-sm text-white">{opportunity.activeVoyage.name}</p>
          <p className="text-xs text-gray-400">{opportunity.activeVoyage.description}</p>
        </div>
      )}

      {/* Points rate + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Earn {opportunity.pointsPerDollar} 🪙 per $1 spent
        </p>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${added
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 active:scale-95'
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
  const [opportunities, setOpportunities] = useState(MOCK_OPPORTUNITIES);
  const [filter, setFilter] = useState('all');
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(true);

  const handleAddToQuests = (opportunity) => {
    // TODO: API call to add to customer quests
    console.log('Adding to quests:', opportunity);
  };

  const filteredOpportunities = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.category.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🔍</span> Discover Treasure
          </h1>
          <p className="text-gray-400 text-sm">Find rewards near you</p>
        </div>
        <button
          className="w-10 h-10 bg-dark-light rounded-xl flex items-center justify-center text-xl"
          onClick={() => {/* TODO: Map view */}}
        >
          🗺️
        </button>
      </div>

      {/* First-time hint */}
      {showFirstTimeHint && (
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-4 mb-6 border border-primary/30 relative">
          <button
            onClick={() => setShowFirstTimeHint(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <p className="text-sm text-white mb-1">
            <span className="font-bold">💡 Welcome aboard, pirate!</span>
          </p>
          <p className="text-xs text-gray-300">
            Browse rewards below. Tap "+ Add to Quests" to start chasing treasure!
          </p>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {['all', 'restaurant', 'coffee shop', 'brewery', 'salon'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
              ${filter === f
                ? 'bg-primary text-dark font-semibold'
                : 'bg-dark-light text-gray-400 hover:text-white'
              }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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
