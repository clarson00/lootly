import { useState } from 'react';

const CONDITION_TYPES = [
  { value: 'location_visit', label: 'Location Visit', icon: '📍' },
  { value: 'spend_amount', label: 'Spend Amount', icon: '💰' },
  { value: 'day_of_week', label: 'Day of Week', icon: '📅' },
  { value: 'time_of_day', label: 'Time of Day', icon: '🕐' },
  { value: 'date_range', label: 'Date Range', icon: '📆' },
  { value: 'customer_attribute', label: 'Customer Attribute', icon: '👤' },
  { value: 'customer_tag', label: 'Customer Tag', icon: '🏷️' },
  { value: 'rule_triggered', label: 'Rule Completed', icon: '✅' },
];

const COMPARISONS = [
  { value: '>=', label: 'at least' },
  { value: '=', label: 'exactly' },
  { value: '<=', label: 'at most' },
  { value: '>', label: 'more than' },
  { value: '<', label: 'less than' },
];

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
];

function SingleConditionEditor({ condition, onChange, onRemove }) {
  const updateParams = (key, value) => {
    onChange({
      ...condition,
      params: { ...condition.params, [key]: value },
    });
  };

  const renderParams = () => {
    switch (condition.type) {
      case 'location_visit':
        return (
          <div className="grid grid-cols-3 gap-3">
            <select
              value={condition.params?.scope || 'any'}
              onChange={(e) => updateParams('scope', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="any">Any location</option>
              <option value="specific">Specific location</option>
              <option value="group">Location group</option>
              <option value="all">All locations</option>
            </select>
            {condition.params?.scope !== 'all' && (
              <>
                <select
                  value={condition.params?.comparison || '>='}
                  onChange={(e) => updateParams('comparison', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {COMPARISONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={condition.params?.value || 1}
                  onChange={(e) => updateParams('value', parseInt(e.target.value) || 1)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="1"
                />
              </>
            )}
          </div>
        );

      case 'spend_amount':
        return (
          <div className="grid grid-cols-3 gap-3">
            <select
              value={condition.params?.scope || 'single_transaction'}
              onChange={(e) => updateParams('scope', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="single_transaction">Single transaction</option>
              <option value="cumulative">Cumulative</option>
            </select>
            <select
              value={condition.params?.comparison || '>='}
              onChange={(e) => updateParams('comparison', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {COMPARISONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={condition.params?.value || 50}
                onChange={(e) => updateParams('value', parseInt(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="0"
              />
            </div>
          </div>
        );

      case 'day_of_week':
        return (
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <label
                key={day.value}
                className={`px-3 py-1.5 rounded-lg border cursor-pointer text-sm ${
                  condition.params?.days?.includes(day.value)
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={condition.params?.days?.includes(day.value)}
                  onChange={(e) => {
                    const days = condition.params?.days || [];
                    if (e.target.checked) {
                      updateParams('days', [...days, day.value]);
                    } else {
                      updateParams('days', days.filter((d) => d !== day.value));
                    }
                  }}
                />
                {day.label}
              </label>
            ))}
          </div>
        );

      case 'time_of_day':
        return (
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={condition.params?.startTime || '09:00'}
              onChange={(e) => updateParams('startTime', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={condition.params?.endTime || '17:00'}
              onChange={(e) => updateParams('endTime', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        );

      case 'date_range':
        return (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={condition.params?.startDate || ''}
              onChange={(e) => updateParams('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={condition.params?.endDate || ''}
              onChange={(e) => updateParams('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        );

      case 'customer_attribute':
        return (
          <div className="grid grid-cols-3 gap-3">
            <select
              value={condition.params?.attribute || 'membership_age_days'}
              onChange={(e) => updateParams('attribute', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="membership_age_days">Membership age (days)</option>
              <option value="tier">Tier</option>
              <option value="lifetime_spend">Lifetime spend</option>
              <option value="lifetime_points">Lifetime points</option>
              <option value="visit_count">Visit count</option>
              <option value="points_balance">Points balance</option>
            </select>
            <select
              value={condition.params?.comparison || '>='}
              onChange={(e) => updateParams('comparison', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {COMPARISONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={condition.params?.value || ''}
              onChange={(e) => updateParams('value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Value"
            />
          </div>
        );

      case 'customer_tag':
        return (
          <div className="grid grid-cols-2 gap-3">
            <select
              value={condition.params?.match || 'has'}
              onChange={(e) => updateParams('match', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="has">Has tag</option>
              <option value="has_not">Does not have tag</option>
              <option value="has_any">Has any of</option>
              <option value="has_all">Has all of</option>
            </select>
            <input
              type="text"
              value={condition.params?.tag || ''}
              onChange={(e) => updateParams('tag', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Tag name"
            />
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-500">
            Configure parameters in the JSON editor below
          </p>
        );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <select
          value={condition.type}
          onChange={(e) => onChange({ type: e.target.value, params: {} })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
        >
          {CONDITION_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.icon} {ct.label}
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
      {renderParams()}
    </div>
  );
}

export default function ConditionBuilder({ conditions, onChange }) {
  const isCompound = conditions?.operator;

  const addCondition = () => {
    if (isCompound) {
      onChange({
        ...conditions,
        items: [...conditions.items, { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } }],
      });
    } else {
      // Convert to compound
      onChange({
        operator: 'AND',
        items: [
          conditions,
          { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
        ],
      });
    }
  };

  const updateCondition = (index, newCondition) => {
    if (isCompound) {
      const newItems = [...conditions.items];
      newItems[index] = newCondition;
      onChange({ ...conditions, items: newItems });
    } else {
      onChange(newCondition);
    }
  };

  const removeCondition = (index) => {
    if (isCompound && conditions.items.length > 1) {
      const newItems = conditions.items.filter((_, i) => i !== index);
      if (newItems.length === 1) {
        // Convert back to single
        onChange(newItems[0]);
      } else {
        onChange({ ...conditions, items: newItems });
      }
    }
  };

  const toggleOperator = () => {
    if (isCompound) {
      onChange({
        ...conditions,
        operator: conditions.operator === 'AND' ? 'OR' : 'AND',
      });
    }
  };

  return (
    <div className="space-y-3">
      {isCompound ? (
        <>
          {conditions.items.map((item, index) => (
            <div key={index}>
              {index > 0 && (
                <button
                  type="button"
                  onClick={toggleOperator}
                  className="mb-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  {conditions.operator}
                </button>
              )}
              <SingleConditionEditor
                condition={item}
                onChange={(c) => updateCondition(index, c)}
                onRemove={conditions.items.length > 1 ? () => removeCondition(index) : null}
              />
            </div>
          ))}
        </>
      ) : (
        <SingleConditionEditor
          condition={conditions}
          onChange={(c) => updateCondition(0, c)}
        />
      )}

      <button
        type="button"
        onClick={addCondition}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Add Condition
      </button>
    </div>
  );
}
