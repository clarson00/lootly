import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock data for demo
const MOCK_QUESTS = [
  {
    id: 'quest_1',
    type: 'reward',
    businessName: "Tony's Downtown",
    businessIcon: '🍕',
    targetName: 'Free Appetizer',
    targetIcon: '💎',
    currentPoints: 320,
    requiredPoints: 500,
    estimatedValue: '$12',
    notifyNearby: true,
    notifyProgress: true,
    lastActivity: '2 days ago'
  },
  {
    id: 'quest_2',
    type: 'voyage',
    businessName: "Tony's Restaurant Group",
    businessIcon: '🍕',
    targetName: 'Grand Tour',
    targetIcon: '🗺️',
    stepsCompleted: 2,
    totalSteps: 4,
    description: 'Visit all 4 locations',
    notifyNearby: true,
    notifyProgress: false,
    lastActivity: '1 week ago'
  },
  {
    id: 'quest_3',
    type: 'reward',
    businessName: "Pirate's Cove Brewing",
    businessIcon: '🍺',
    targetName: 'Free Pint',
    targetIcon: '🍺',
    currentPoints: 45,
    requiredPoints: 200,
    estimatedValue: '$8',
    notifyNearby: false,
    notifyProgress: true,
    lastActivity: '3 days ago'
  }
];

function QuestCard({ quest, onRemove, onToggleNotify }) {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const progress = quest.type === 'reward'
    ? (quest.currentPoints / quest.requiredPoints) * 100
    : (quest.stepsCompleted / quest.totalSteps) * 100;

  const progressText = quest.type === 'reward'
    ? `${quest.currentPoints} / ${quest.requiredPoints} 🪙`
    : `${quest.stepsCompleted} / ${quest.totalSteps} steps`;

  return (
    <div className="bg-dark-light rounded-2xl p-4 border border-gray-800 relative">
      {/* Options menu */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
      >
        ⋯
      </button>

      {showOptions && (
        <div className="absolute top-12 right-3 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden z-10 shadow-xl">
          <button
            onClick={() => {
              onToggleNotify(quest.id, 'nearby');
              setShowOptions(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            {quest.notifyNearby ? '🔔' : '🔕'} Nearby alerts
          </button>
          <button
            onClick={() => {
              onToggleNotify(quest.id, 'progress');
              setShowOptions(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            {quest.notifyProgress ? '🔔' : '🔕'} Progress alerts
          </button>
          <button
            onClick={() => {
              onRemove(quest.id);
              setShowOptions(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
          >
            🗑️ Remove quest
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pr-8">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-2xl">
          {quest.businessIcon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{quest.businessName}</h3>
          <p className="text-primary text-sm flex items-center gap-1">
            <span>{quest.targetIcon}</span>
            {quest.targetName}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{progressText}</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Voyage description */}
      {quest.type === 'voyage' && quest.description && (
        <p className="text-xs text-gray-500 mb-3">{quest.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {quest.notifyNearby && (
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
              📍 Nearby
            </span>
          )}
          {quest.notifyProgress && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              🔔 Updates
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{quest.lastActivity}</span>
      </div>

      {/* Estimated value for rewards */}
      {quest.type === 'reward' && quest.estimatedValue && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-400">
            Estimated value: <span className="text-white">{quest.estimatedValue}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyQuests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('active');

  // Load quests from localStorage (added from Discover) + mock data
  const [quests, setQuests] = useState(() => {
    const savedQuests = JSON.parse(localStorage.getItem('lootly_quests') || '[]');
    // Combine saved quests with mock data, avoiding duplicates
    const mockIds = MOCK_QUESTS.map(q => q.id);
    const uniqueSaved = savedQuests.filter(q => !mockIds.includes(q.id));
    return [...MOCK_QUESTS, ...uniqueSaved];
  });

  const handleRemove = (questId) => {
    setQuests(quests.filter(q => q.id !== questId));

    // Also remove from localStorage so it reappears in Discover
    const savedQuests = JSON.parse(localStorage.getItem('lootly_quests') || '[]');
    localStorage.setItem('lootly_quests', JSON.stringify(savedQuests.filter(q => q.id !== questId)));

    const addedIds = JSON.parse(localStorage.getItem('lootly_added_quests') || '[]');
    localStorage.setItem('lootly_added_quests', JSON.stringify(addedIds.filter(id => id !== questId)));
  };

  const handleToggleNotify = (questId, type) => {
    setQuests(quests.map(q => {
      if (q.id !== questId) return q;
      return {
        ...q,
        [type === 'nearby' ? 'notifyNearby' : 'notifyProgress']:
          !q[type === 'nearby' ? 'notifyNearby' : 'notifyProgress']
      };
    }));
  };

  const activeQuests = quests.filter(q => {
    if (q.type === 'reward') return q.currentPoints < q.requiredPoints;
    return q.stepsCompleted < q.totalSteps;
  });

  const completedQuests = quests.filter(q => {
    if (q.type === 'reward') return q.currentPoints >= q.requiredPoints;
    return q.stepsCompleted >= q.totalSteps;
  });

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🗺️</span> My Quests
        </h1>
        <p className="text-gray-400 text-sm">Treasure you're chasing</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-dark-light rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{activeQuests.length}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="flex-1 bg-dark-light rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-secondary">{completedQuests.length}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="flex-1 bg-dark-light rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">
            {quests.filter(q => q.notifyNearby).length}
          </p>
          <p className="text-xs text-gray-400">Alerts On</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
            ${filter === 'active'
              ? 'bg-primary text-dark'
              : 'bg-dark-light text-gray-400'
            }`}
        >
          Active ({activeQuests.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
            ${filter === 'completed'
              ? 'bg-secondary text-dark'
              : 'bg-dark-light text-gray-400'
            }`}
        >
          Completed ({completedQuests.length})
        </button>
      </div>

      {/* Quest list */}
      <div className="space-y-4">
        {filter === 'active' && activeQuests.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onRemove={handleRemove}
            onToggleNotify={handleToggleNotify}
          />
        ))}

        {filter === 'completed' && completedQuests.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onRemove={handleRemove}
            onToggleNotify={handleToggleNotify}
          />
        ))}
      </div>

      {/* Empty states */}
      {filter === 'active' && activeQuests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏴‍☠️</div>
          <p className="text-white font-semibold mb-2">No active quests</p>
          <p className="text-gray-400 text-sm mb-6">
            Discover treasure to chase!
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="bg-primary text-dark font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all"
          >
            🔍 Discover Treasure
          </button>
        </div>
      )}

      {filter === 'completed' && completedQuests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-white font-semibold mb-2">No completed quests yet</p>
          <p className="text-gray-400 text-sm">
            Keep earning to claim your treasure!
          </p>
        </div>
      )}
    </div>
  );
}
