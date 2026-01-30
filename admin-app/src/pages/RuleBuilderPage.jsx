import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';
import ConditionBuilder from '../components/rules/ConditionBuilder';
import AwardBuilder from '../components/rules/AwardBuilder';

const CONDITION_TEMPLATES = [
  {
    name: 'Visit any location',
    conditions: { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
  },
  {
    name: 'Visit all locations',
    conditions: { type: 'location_visit', params: { scope: 'all' } },
  },
  {
    name: 'Spend $50+',
    conditions: { type: 'spend_amount', params: { scope: 'single_transaction', comparison: '>=', value: 50 } },
  },
  {
    name: 'Weekend visit',
    conditions: {
      operator: 'AND',
      items: [
        { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
        { type: 'day_of_week', params: { days: ['saturday', 'sunday'] } },
      ],
    },
  },
];

export default function RuleBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessId } = useAdminAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayName: '',
    displayDescription: '',
    hint: '',
    icon: '📜',
    conditions: { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
    awards: [{ type: 'bonus_points', value: 50 }],
    isRepeatable: true,
    cooldownDays: null,
    maxTriggersPerCustomer: null,
    isActive: false,
    priority: 0,
    startsAt: '',
    endsAt: '',
  });

  const [errors, setErrors] = useState({});

  // Load existing rule if editing
  const { data: existingRule, isLoading } = useQuery({
    queryKey: ['rule', businessId, id],
    queryFn: () => api.getRule(businessId, id),
    enabled: isEditing && !!businessId,
  });

  useEffect(() => {
    if (existingRule?.data?.rule) {
      const rule = existingRule.data.rule;
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        displayName: rule.displayName || '',
        displayDescription: rule.displayDescription || '',
        hint: rule.hint || '',
        icon: rule.icon || '📜',
        conditions: rule.conditions || { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
        awards: rule.awards?.length ? rule.awards : [{ type: 'bonus_points', value: 50 }],
        isRepeatable: rule.isRepeatable ?? true,
        cooldownDays: rule.cooldownDays || null,
        maxTriggersPerCustomer: rule.maxTriggersPerCustomer || null,
        isActive: rule.isActive ?? false,
        priority: rule.priority || 0,
        startsAt: rule.startsAt ? new Date(rule.startsAt).toISOString().split('T')[0] : '',
        endsAt: rule.endsAt ? new Date(rule.endsAt).toISOString().split('T')[0] : '',
      });
    }
  }, [existingRule]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? api.updateRule(businessId, id, data)
        : api.createRule(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', businessId] });
      navigate('/rules');
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleTemplateSelect = (template) => {
    setFormData((prev) => ({
      ...prev,
      conditions: template.conditions,
    }));
  };

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
          {isEditing ? 'Edit Rule' : 'Create Rule'}
        </h1>
        <p className="text-gray-500">
          {isEditing
            ? 'Update the rule configuration'
            : 'Build a new loyalty rule for your customers'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Weekend Warrior Bonus"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="📜"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Internal description for this rule"
              />
            </div>
          </div>
        </section>

        {/* Customer-Facing (Pirate Theme) */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Customer-Facing Display</h2>
          <p className="text-sm text-gray-500 mb-4">How this appears to customers (pirate-themed)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Weekend Plunderer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Description
              </label>
              <textarea
                value={formData.displayDescription}
                onChange={(e) => setFormData({ ...formData, displayDescription: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Sail in on the weekend and claim yer bonus doubloons!"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hint
              </label>
              <input
                type="text"
                value={formData.hint}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Hint: Saturday and Sunday be the best days!"
              />
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Conditions</h2>
          <p className="text-sm text-gray-500 mb-4">When should this rule trigger?</p>

          {/* Quick Templates */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Start Templates:</p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <ConditionBuilder
            conditions={formData.conditions}
            onChange={(conditions) => setFormData({ ...formData, conditions })}
          />
        </section>

        {/* Awards */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Awards</h2>
          <p className="text-sm text-gray-500 mb-4">What does the customer earn when triggered?</p>

          <AwardBuilder
            awards={formData.awards}
            onChange={(awards) => setFormData({ ...formData, awards })}
          />
        </section>

        {/* Behavior */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Behavior</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isRepeatable}
                onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Repeatable (can trigger multiple times per customer)</span>
            </label>

            {formData.isRepeatable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cooldown (days)
                  </label>
                  <input
                    type="number"
                    value={formData.cooldownDays || ''}
                    onChange={(e) => setFormData({ ...formData, cooldownDays: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="No cooldown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Triggers Per Customer
                  </label>
                  <input
                    type="number"
                    value={formData.maxTriggersPerCustomer || ''}
                    onChange={(e) => setFormData({ ...formData, maxTriggersPerCustomer: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Scheduling */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
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
              <span className="text-gray-700 font-medium">Active (rule is live)</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/rules')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
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
