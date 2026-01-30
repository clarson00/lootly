const AWARD_TYPES = [
  { value: 'bonus_points', label: 'Bonus Points', icon: '🎯' },
  { value: 'multiplier', label: 'Points Multiplier', icon: '✨' },
  { value: 'unlock_reward', label: 'Unlock Reward', icon: '🎁' },
  { value: 'apply_tag', label: 'Apply Tag', icon: '🏷️' },
];

function SingleAwardEditor({ award, onChange, onRemove }) {
  const updateField = (key, value) => {
    onChange({ ...award, [key]: value });
  };

  const renderFields = () => {
    switch (award.type) {
      case 'bonus_points':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Award</span>
            <input
              type="number"
              value={award.value || 50}
              onChange={(e) => updateField('value', parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="1"
            />
            <span className="text-gray-500 text-sm">bonus points</span>
          </div>
        );

      case 'multiplier':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Set multiplier to</span>
              <input
                type="number"
                step="0.1"
                value={award.value || 2}
                onChange={(e) => updateField('value', parseFloat(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="1"
              />
              <span className="text-gray-500 text-sm">x</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={award.duration || 'permanent'}
                onChange={(e) => updateField('duration', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="permanent">Permanent</option>
                <option value="days">For X days</option>
              </select>
              {award.duration === 'days' && (
                <input
                  type="number"
                  value={award.durationValue || 7}
                  onChange={(e) => updateField('durationValue', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="1"
                />
              )}
            </div>
          </div>
        );

      case 'unlock_reward':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Unlock reward ID:</span>
            <input
              type="text"
              value={award.rewardId || ''}
              onChange={(e) => updateField('rewardId', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="reward_xxx"
            />
          </div>
        );

      case 'apply_tag':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Apply tag:</span>
              <input
                type="text"
                value={award.tag || ''}
                onChange={(e) => updateField('tag', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g., grand_voyage_complete"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={!!award.expiresDays}
                  onChange={(e) => updateField('expiresDays', e.target.checked ? 30 : null)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                Expires after
              </label>
              {award.expiresDays && (
                <>
                  <input
                    type="number"
                    value={award.expiresDays || 30}
                    onChange={(e) => updateField('expiresDays', parseInt(e.target.value) || 30)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="1"
                  />
                  <span className="text-gray-500 text-sm">days</span>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
      <div className="flex items-start justify-between mb-3">
        <select
          value={award.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
        >
          {AWARD_TYPES.map((at) => (
            <option key={at.value} value={at.value}>
              {at.icon} {at.label}
            </option>
          ))}
        </select>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        )}
      </div>
      {renderFields()}
    </div>
  );
}

export default function AwardBuilder({ awards, onChange }) {
  const addAward = () => {
    onChange([...awards, { type: 'bonus_points', value: 50 }]);
  };

  const updateAward = (index, newAward) => {
    const newAwards = [...awards];
    newAwards[index] = newAward;
    onChange(newAwards);
  };

  const removeAward = (index) => {
    if (awards.length > 1) {
      onChange(awards.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      {awards.map((award, index) => (
        <SingleAwardEditor
          key={index}
          award={award}
          onChange={(a) => updateAward(index, a)}
          onRemove={awards.length > 1 ? () => removeAward(index) : null}
        />
      ))}

      <button
        type="button"
        onClick={addAward}
        className="w-full py-2 border-2 border-dashed border-amber-300 rounded-lg text-sm text-amber-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
      >
        + Add Award
      </button>
    </div>
  );
}
