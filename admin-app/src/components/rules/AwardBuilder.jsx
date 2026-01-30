import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';

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
    <div className="bg-white rounded-lg p-3 border border-gray-200">
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

function AwardGroupEditor({ group, groupIndex, locations, onChange, onRemove, showLocationPicker }) {
  const awards = group.awards || [];

  const updateAward = (index, newAward) => {
    const newAwards = [...awards];
    newAwards[index] = newAward;
    onChange({ ...group, awards: newAwards });
  };

  const addAward = () => {
    const newAwards = [...awards, { type: 'bonus_points', value: 50 }];
    onChange({ ...group, awards: newAwards });
  };

  const removeAward = (index) => {
    onChange({ ...group, awards: awards.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
            Option {groupIndex + 1}
          </span>
          {showLocationPicker && (
            <select
              value={group.locationId || ''}
              onChange={(e) => onChange({ ...group, locationId: e.target.value || null })}
              className="px-3 py-1 border border-amber-300 rounded-lg text-sm bg-white"
            >
              <option value="">Any Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.icon} {loc.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove Option
          </button>
        )}
      </div>

      <div className="space-y-3">
        {awards.length === 0 ? (
          <div className="bg-white/50 rounded-lg p-4 border border-dashed border-amber-300 text-center">
            <p className="text-sm text-amber-700">No awards (checkpoint only)</p>
          </div>
        ) : (
          awards.map((award, index) => (
            <SingleAwardEditor
              key={index}
              award={award}
              onChange={(a) => updateAward(index, a)}
              onRemove={() => removeAward(index)}
            />
          ))
        )}

        <button
          type="button"
          onClick={addAward}
          className="w-full py-2 border-2 border-dashed border-amber-300 rounded-lg text-sm text-amber-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          + Add Award to This Option
        </button>
      </div>

      {group.locationId && (
        <p className="mt-3 text-xs text-amber-700">
          Customer must claim at: {locations.find(l => l.id === group.locationId)?.name || group.locationId}
        </p>
      )}
    </div>
  );
}

export default function AwardBuilder({ awards, onChange }) {
  const { businessId } = useAdminAuth();
  const [mode, setMode] = useState('simple'); // 'simple' | 'composable'

  // Fetch locations for location picker
  const { data: businessData } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => api.getLocations(businessId),
    enabled: !!businessId,
  });

  const locations = businessData?.data?.locations || [];

  // Determine initial mode from awards structure
  useEffect(() => {
    if (awards && awards.operator) {
      setMode('composable');
    } else if (Array.isArray(awards) && awards.length > 0) {
      setMode('simple');
    }
  }, []);

  // Convert between modes
  const switchToComposable = () => {
    const currentAwards = Array.isArray(awards) ? awards : [];
    onChange({
      operator: 'OR',
      groups: [
        { locationId: null, awards: currentAwards.length > 0 ? currentAwards : [{ type: 'bonus_points', value: 50 }] },
      ],
    });
    setMode('composable');
  };

  const switchToSimple = () => {
    // Extract awards from first group if composable
    let simpleAwards = [{ type: 'bonus_points', value: 50 }];
    if (awards?.groups?.[0]?.awards) {
      simpleAwards = awards.groups[0].awards;
    } else if (Array.isArray(awards)) {
      simpleAwards = awards;
    }
    onChange(simpleAwards);
    setMode('simple');
  };

  // Simple mode: just an array of awards
  if (mode === 'simple') {
    const simpleAwards = Array.isArray(awards) ? awards : [];

    const addAward = () => {
      onChange([...simpleAwards, { type: 'bonus_points', value: 50 }]);
    };

    const updateAward = (index, newAward) => {
      const newAwards = [...simpleAwards];
      newAwards[index] = newAward;
      onChange(newAwards);
    };

    const removeAward = (index) => {
      onChange(simpleAwards.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Awards
          </label>
          <button
            type="button"
            onClick={switchToComposable}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Switch to Location-Based Options
          </button>
        </div>

        {simpleAwards.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
            <span className="text-3xl">🎯</span>
            <p className="mt-2 text-sm font-medium text-gray-600">No Awards (Checkpoint)</p>
            <p className="text-xs text-gray-500 mt-1">
              This step tracks progress without giving rewards
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {simpleAwards.map((award, index) => (
              <div key={index} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <SingleAwardEditor
                  award={award}
                  onChange={(a) => updateAward(index, a)}
                  onRemove={() => removeAward(index)}
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addAward}
          className="w-full py-2 border-2 border-dashed border-amber-300 rounded-lg text-sm text-amber-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          + Add Award
        </button>

        {simpleAwards.length > 0 && (
          <p className="text-xs text-gray-500">
            All awards will be given when the rule triggers.
          </p>
        )}
      </div>
    );
  }

  // Composable mode: OR groups with optional location targeting
  const composableAwards = awards?.operator ? awards : {
    operator: 'OR',
    groups: [{ locationId: null, awards: [{ type: 'bonus_points', value: 50 }] }],
  };

  const groups = composableAwards.groups || [];

  const updateGroup = (index, newGroup) => {
    const newGroups = [...groups];
    newGroups[index] = newGroup;
    onChange({ ...composableAwards, groups: newGroups });
  };

  const addGroup = () => {
    onChange({
      ...composableAwards,
      groups: [...groups, { locationId: null, awards: [{ type: 'bonus_points', value: 50 }] }],
    });
  };

  const removeGroup = (index) => {
    if (groups.length > 1) {
      onChange({
        ...composableAwards,
        groups: groups.filter((_, i) => i !== index),
      });
    }
  };

  const toggleOperator = () => {
    onChange({
      ...composableAwards,
      operator: composableAwards.operator === 'OR' ? 'AND' : 'OR',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Awards
        </label>
        <button
          type="button"
          onClick={switchToSimple}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          Switch to Simple Mode
        </button>
      </div>

      {/* Operator toggle */}
      <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Mode:</span>
        <button
          type="button"
          onClick={toggleOperator}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            composableAwards.operator === 'OR'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          OR (Customer Picks One)
        </button>
        <button
          type="button"
          onClick={toggleOperator}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            composableAwards.operator === 'AND'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          AND (Customer Gets All)
        </button>
      </div>

      {composableAwards.operator === 'OR' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <strong>OR Mode:</strong> Customer will choose ONE option below. Use this to let customers pick which location to claim rewards at.
        </div>
      )}

      {composableAwards.operator === 'AND' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          <strong>AND Mode:</strong> Customer receives ALL awards from all groups when triggered.
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group, index) => (
          <AwardGroupEditor
            key={index}
            group={group}
            groupIndex={index}
            locations={locations}
            onChange={(g) => updateGroup(index, g)}
            onRemove={groups.length > 1 ? () => removeGroup(index) : null}
            showLocationPicker={composableAwards.operator === 'OR'}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="w-full py-3 border-2 border-dashed border-amber-400 rounded-xl text-sm text-amber-600 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors font-medium"
      >
        + Add {composableAwards.operator === 'OR' ? 'Another Option' : 'Another Group'}
      </button>

      {composableAwards.operator === 'OR' && groups.length >= 2 && (
        <p className="text-xs text-gray-500">
          Customer will see all options and choose where to claim their rewards.
          Add more awards to specific locations to incentivize visits there!
        </p>
      )}
    </div>
  );
}
