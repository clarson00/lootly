import { useState } from 'react';
import ConditionBuilder from '../rules/ConditionBuilder';
import AwardBuilder from '../rules/AwardBuilder';

const DEFAULT_CONDITION = {
  type: 'location_visit',
  params: { scope: 'any', comparison: '>=', value: 1 },
};

const DEFAULT_AWARDS = [];

export default function StepBuilder({ step, onChange, onCancel, onSave, stepNumber }) {
  const [formData, setFormData] = useState({
    name: step?.name || '',
    displayName: step?.displayName || '',
    icon: step?.icon || '📍',
    conditions: step?.conditions || DEFAULT_CONDITION,
    awards: step?.awards || DEFAULT_AWARDS,
    startsAt: step?.startsAt ? new Date(step.startsAt).toISOString().split('T')[0] : '',
    endsAt: step?.endsAt ? new Date(step.endsAt).toISOString().split('T')[0] : '',
    isRepeatable: step?.isRepeatable ?? false,
    cooldownDays: step?.cooldownDays || null,
    maxTriggersPerCustomer: step?.maxTriggersPerCustomer || null,
  });

  const [errors, setErrors] = useState({});

  const handleSave = () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Step name is required' });
      return;
    }

    onSave({
      ...step,
      ...formData,
      startsAt: formData.startsAt || null,
      endsAt: formData.endsAt || null,
    });
  };

  return (
    <div className="bg-white border-2 border-primary-300 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {step?.id ? `Edit Step ${stepNumber}` : `New Step ${stepNumber}`}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {step?.id ? 'Update Step' : 'Add Step'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Visit Tony's Pizza"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Name (customer-facing)
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Dock at the Pizza Port"
        />
      </div>

      {/* Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conditions
        </label>
        <p className="text-sm text-gray-500 mb-3">When should this step be completed?</p>
        <ConditionBuilder
          conditions={formData.conditions}
          onChange={(conditions) => setFormData({ ...formData, conditions })}
        />
      </div>

      {/* Awards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Awards (Optional)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Leave empty for checkpoint steps, or add rewards for milestones
        </p>
        <AwardBuilder
          awards={formData.awards}
          onChange={(awards) => setFormData({ ...formData, awards })}
        />
      </div>

      {/* Step Scheduling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step Time Bounds (Optional)
        </label>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Behavior */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Step Behavior
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isRepeatable}
              onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Repeatable (can trigger multiple times)</span>
          </label>

          {formData.isRepeatable && (
            <div className="ml-7 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Cooldown:</label>
                <input
                  type="number"
                  value={formData.cooldownDays || ''}
                  onChange={(e) => setFormData({ ...formData, cooldownDays: parseInt(e.target.value) || null })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="None"
                  min="1"
                />
                <span className="text-sm text-gray-500">days</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Max triggers:</label>
                <input
                  type="number"
                  value={formData.maxTriggersPerCustomer || ''}
                  onChange={(e) => setFormData({ ...formData, maxTriggersPerCustomer: parseInt(e.target.value) || null })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="∞"
                  min="1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
