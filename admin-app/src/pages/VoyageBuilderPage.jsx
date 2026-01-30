import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

const THEMES = [
  { value: 'voyage', label: 'Voyage', icon: '⛵' },
  { value: 'treasure_hunt', label: 'Treasure Hunt', icon: '💎' },
  { value: 'quest', label: 'Quest', icon: '⚔️' },
  { value: 'expedition', label: 'Expedition', icon: '🏔️' },
];

const CHAIN_TYPES = [
  { value: 'sequential', label: 'Sequential', description: 'Complete in order' },
  { value: 'parallel', label: 'Parallel', description: 'Complete in any order' },
  { value: 'progressive', label: 'Progressive', description: 'Each builds on previous' },
];

export default function VoyageBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessId } = useAdminAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: 'voyage',
    displayName: '',
    tagline: '',
    narrativeIntro: '',
    narrativeComplete: '',
    icon: '🗺️',
    color: '#f97316',
    chainType: 'parallel',
    timeLimitValue: null,
    timeLimitUnit: 'days',
    isVisibleToCustomer: true,
    showProgress: true,
    showLockedSteps: true,
    isActive: false,
    priority: 0,
    startsAt: '',
    endsAt: '',
  });

  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const [errors, setErrors] = useState({});

  // Load existing ruleset if editing
  const { data: existingRuleset, isLoading } = useQuery({
    queryKey: ['ruleset', businessId, id],
    queryFn: () => api.getRuleset(businessId, id),
    enabled: isEditing && !!businessId,
  });

  // Load available rules
  const { data: rulesData } = useQuery({
    queryKey: ['rules', businessId],
    queryFn: () => api.getRules(businessId),
    enabled: !!businessId,
  });

  useEffect(() => {
    if (existingRuleset?.data?.ruleset) {
      const rs = existingRuleset.data.ruleset;
      setFormData({
        name: rs.name || '',
        description: rs.description || '',
        theme: rs.theme || 'voyage',
        displayName: rs.displayName || '',
        tagline: rs.tagline || '',
        narrativeIntro: rs.narrativeIntro || '',
        narrativeComplete: rs.narrativeComplete || '',
        icon: rs.icon || '🗺️',
        color: rs.color || '#f97316',
        chainType: rs.chainType || 'parallel',
        timeLimitValue: rs.timeLimitValue || null,
        timeLimitUnit: rs.timeLimitUnit || 'days',
        isVisibleToCustomer: rs.isVisibleToCustomer ?? true,
        showProgress: rs.showProgress ?? true,
        showLockedSteps: rs.showLockedSteps ?? true,
        isActive: rs.isActive ?? false,
        priority: rs.priority || 0,
        startsAt: rs.startsAt ? new Date(rs.startsAt).toISOString().split('T')[0] : '',
        endsAt: rs.endsAt ? new Date(rs.endsAt).toISOString().split('T')[0] : '',
      });

      if (existingRuleset.data.rules) {
        setSelectedRuleIds(existingRuleset.data.rules.map(r => r.id));
      }
    }
  }, [existingRuleset]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let rulesetId = id;

      if (isEditing) {
        await api.updateRuleset(businessId, id, data);
      } else {
        const result = await api.createRuleset(businessId, data);
        rulesetId = result.data.ruleset.id;
      }

      // Update rules in the ruleset
      if (selectedRuleIds.length > 0) {
        await api.addRulesToRuleset(businessId, rulesetId, selectedRuleIds);
      }

      return rulesetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulesets', businessId] });
      navigate('/voyages');
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    saveMutation.mutate(formData);
  };

  const toggleRule = (ruleId) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const availableRules = rulesData?.data?.rules || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Voyage' : 'Create Voyage'}
        </h1>
        <p className="text-gray-500">
          Build a multi-step journey for your customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voyage Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Grand Tour"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chain Type
              </label>
              <select
                value={formData.chainType}
                onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {CHAIN_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label} - {ct.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Customer-Facing Content */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Customer-Facing Content</h2>
          <p className="text-sm text-gray-500 mb-4">Pirate-themed messaging for customers</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., The Grand Voyage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Chart yer course to riches!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Introduction Message
              </label>
              <textarea
                value={formData.narrativeIntro}
                onChange={(e) => setFormData({ ...formData, narrativeIntro: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Ahoy, matey! Yer adventure begins..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Message
              </label>
              <textarea
                value={formData.narrativeComplete}
                onChange={(e) => setFormData({ ...formData, narrativeComplete: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Shiver me timbers! Ye've completed the voyage!"
              />
            </div>
          </div>
        </section>

        {/* Rules Selection */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Rules in this Voyage</h2>
          <p className="text-sm text-gray-500 mb-4">Select which rules are part of this journey</p>

          {availableRules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No rules available. Create some rules first.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableRules.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRuleIds.includes(rule.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRuleIds.includes(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-2xl">{rule.icon || '📜'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{rule.name}</p>
                    <p className="text-sm text-gray-500">{rule.plainLanguage}</p>
                  </div>
                  {rule.rulesetId && rule.rulesetId !== id && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      In another voyage
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          <p className="mt-4 text-sm text-gray-500">
            Selected: {selectedRuleIds.length} rules
          </p>
        </section>

        {/* Time Limit */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Limit (Optional)</h2>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData.timeLimitValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeLimitValue: e.target.checked ? 30 : null,
                  })
                }
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Customer must complete within</span>
            </label>
            {formData.timeLimitValue && (
              <>
                <input
                  type="number"
                  value={formData.timeLimitValue}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimitValue: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
                <select
                  value={formData.timeLimitUnit}
                  onChange={(e) => setFormData({ ...formData, timeLimitUnit: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                </select>
              </>
            )}
          </div>
        </section>

        {/* Visibility Options */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isVisibleToCustomer}
                onChange={(e) => setFormData({ ...formData, isVisibleToCustomer: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Visible to customers</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showProgress}
                onChange={(e) => setFormData({ ...formData, showProgress: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Show progress bar</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showLockedSteps}
                onChange={(e) => setFormData({ ...formData, showLockedSteps: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Show locked steps (for sequential)</span>
            </label>
          </div>
        </section>

        {/* Status & Submit */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 font-medium">Active (voyage is live)</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/voyages')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Voyage' : 'Create Voyage'}
              </button>
            </div>
          </div>

          {errors.submit && (
            <p className="mt-4 text-sm text-red-600">{errors.submit}</p>
          )}
        </section>
      </form>
    </div>
  );
}
