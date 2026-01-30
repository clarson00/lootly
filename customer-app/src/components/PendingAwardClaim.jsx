import { useState } from 'react';
import api from '../api/client';

function formatAward(award) {
  switch (award.type) {
    case 'bonus_points':
      return `+${award.value} doubloons`;
    case 'multiplier':
      return `${award.value}x point multiplier`;
    case 'unlock_reward':
      return 'Unlock special reward';
    case 'apply_tag':
      return `Earn "${award.tag}" badge`;
    default:
      return 'Mystery reward';
  }
}

function AwardGroupCard({ group, isSelected, onSelect, disabled }) {
  const location = group.location;
  const awards = group.awards || [];

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-gray-700 bg-dark-light hover:border-gray-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Location header */}
      {location ? (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{location.icon || '📍'}</span>
          <div>
            <p className="font-semibold text-white">{location.name}</p>
            <p className="text-xs text-gray-400">Claim at this location</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="font-semibold text-white">Any Location</p>
            <p className="text-xs text-gray-400">Claim anywhere</p>
          </div>
        </div>
      )}

      {/* Awards list */}
      <div className="space-y-2">
        {awards.map((award, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-primary">✦</span>
            <span className="text-gray-300">{formatAward(award)}</span>
          </div>
        ))}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-primary text-sm font-medium">
          <span>✓</span>
          <span>Selected</span>
        </div>
      )}

      {/* Incentive highlight */}
      {awards.length > 1 && (
        <div className="mt-2 text-xs text-secondary font-medium">
          {awards.length} rewards included!
        </div>
      )}
    </button>
  );
}

export default function PendingAwardClaim({ choice, onClaimed, onClose }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const groups = choice.groups || [];

  const handleClaim = async () => {
    if (selectedGroup === null) {
      setError('Please select an option');
      return;
    }

    setClaiming(true);
    setError('');

    try {
      const result = await api.claimAward(choice.id, selectedGroup);
      setSuccess(result.data);

      // Notify parent after a short delay for celebration
      setTimeout(() => {
        onClaimed?.(result.data);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-dark/95 z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center animate-bounce">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-primary mb-2">LOOT CLAIMED!</h1>
          {success.claimedLocation && (
            <p className="text-gray-400">
              Claimed at {success.claimedLocation.icon} {success.claimedLocation.name}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-2">
          {(success.awardsGiven || []).map((item, i) => (
            <div
              key={i}
              className="bg-dark-light rounded-xl p-4 border border-primary/30 flex items-center gap-3"
              style={{ animation: `fadeIn 0.5s ease-out ${i * 0.2}s both` }}
            >
              <span className="text-2xl">🎁</span>
              <span className="text-white">{formatAward(item.award)}</span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark/95 z-50 flex flex-col overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-dark/90 backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{choice.ruleIcon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{choice.ruleName}</h1>
              <p className="text-gray-400 text-sm">Choose where to claim yer loot!</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        <p className="text-gray-300 text-center">
          Ye've earned a reward, captain! Pick where ye want to claim it.
          Different ports may offer different treasures!
        </p>

        {/* Options */}
        <div className="space-y-3">
          {groups.map((group, index) => (
            <AwardGroupCard
              key={index}
              group={group}
              isSelected={selectedGroup === index}
              onSelect={() => setSelectedGroup(index)}
              disabled={claiming}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-dark/90 backdrop-blur-sm p-4 border-t border-gray-800 safe-bottom">
        <button
          onClick={handleClaim}
          disabled={selectedGroup === null || claiming}
          className="w-full py-4 bg-primary text-dark font-bold rounded-xl text-lg
                     hover:bg-yellow-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? 'Claiming...' : selectedGroup !== null ? 'Claim Loot!' : 'Select an Option'}
        </button>
      </div>
    </div>
  );
}
