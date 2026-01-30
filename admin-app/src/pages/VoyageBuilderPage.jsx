import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';
import StepBuilder from '../components/voyages/StepBuilder';
import AddStepModal from '../components/voyages/AddStepModal';
import WalkthroughDrawer from '../components/rules/WalkthroughDrawer';

const THEMES = [
  { value: 'voyage', label: 'Voyage', icon: '⛵' },
  { value: 'treasure_hunt', label: 'Treasure Hunt', icon: '💎' },
  { value: 'quest', label: 'Quest', icon: '⚔️' },
  { value: 'expedition', label: 'Expedition', icon: '🏔️' },
];

const CHAIN_TYPES = [
  { value: 'sequential', label: 'Sequential', description: 'Complete steps in order' },
  { value: 'parallel', label: 'Parallel', description: 'Complete steps in any order' },
];

function StepCard({ step, index, total, isSequential, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const hasAwards = step.awards && (
    Array.isArray(step.awards) ? step.awards.length > 0 : step.awards.groups?.length > 0
  );

  return (
    <div className="relative">
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 -mb-2 z-0" />
      )}

      <div className="relative z-10 flex gap-4">
        {/* Step number */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
          hasAwards
            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
            : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
        }`}>
          {step.icon || index + 1}
        </div>

        {/* Step content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{step.name}</h4>
              {step.displayName && (
                <p className="text-sm text-gray-500 italic">{step.displayName}</p>
              )}
              {step.plainLanguage && (
                <p className="text-sm text-gray-600 mt-1">{step.plainLanguage}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isSequential && (
                <>
                  <button
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMoveDown(index)}
                    disabled={index === total - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                onClick={() => onEdit(index)}
                className="p-1 text-primary-600 hover:text-primary-700"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(index)}
                className="p-1 text-red-500 hover:text-red-600"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Awards indicator */}
          <div className="mt-3 flex items-center gap-2">
            {hasAwards ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                🎁 Has rewards
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Checkpoint (no rewards)
              </span>
            )}

            {step.startsAt && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Starts: {new Date(step.startsAt).toLocaleDateString()}
              </span>
            )}

            {step.endsAt && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Ends: {new Date(step.endsAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    chainType: 'sequential',
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

  const [steps, setSteps] = useState([]); // Array of step objects (rules)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [errors, setErrors] = useState({});

  // Load existing ruleset if editing
  const { data: existingRuleset, isLoading } = useQuery({
    queryKey: ['ruleset', businessId, id],
    queryFn: () => api.getRuleset(businessId, id),
    enabled: isEditing && !!businessId,
  });

  // Load locations for walkthrough
  const { data: businessData } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => api.getLocations(businessId),
    enabled: !!businessId,
  });

  const locations = businessData?.data?.locations || [];
  const locationGroups = businessData?.data?.locationGroups || [];

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
        chainType: rs.chainType || 'sequential',
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

      // Load steps (rules) sorted by sequence order
      if (existingRuleset.data.rules) {
        const sortedRules = [...existingRuleset.data.rules].sort(
          (a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0)
        );
        setSteps(sortedRules);
      }
    }
  }, [existingRuleset]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let rulesetId = id;

      // Create or update the voyage
      if (isEditing) {
        await api.updateRuleset(businessId, id, data.voyageData);
      } else {
        const result = await api.createRuleset(businessId, data.voyageData);
        rulesetId = result.data.ruleset.id;
      }

      // Save steps (rules) with sequence order
      const stepPromises = data.steps.map(async (step, index) => {
        const ruleData = {
          ...step,
          rulesetId,
          sequenceOrder: index + 1,
          // Ensure conditions and awards are properly formatted
          conditions: step.conditions,
          awards: step.awards || [],
        };

        if (step.id && step.id.startsWith('rule_')) {
          // Update existing rule
          return api.updateRule(businessId, step.id, ruleData);
        } else {
          // Create new rule
          return api.createRule(businessId, ruleData);
        }
      });

      await Promise.all(stepPromises);

      // Delete removed steps
      if (isEditing && existingRuleset?.data?.rules) {
        const currentStepIds = data.steps.filter(s => s.id).map(s => s.id);
        const removedRules = existingRuleset.data.rules.filter(
          r => !currentStepIds.includes(r.id)
        );

        for (const rule of removedRules) {
          await api.deleteRule(businessId, rule.id);
        }
      }

      return rulesetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulesets', businessId] });
      queryClient.invalidateQueries({ queryKey: ['rules', businessId] });
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
      setErrors({ name: 'Voyage name is required' });
      return;
    }

    if (steps.length === 0) {
      setErrors({ steps: 'Add at least one step to the voyage' });
      return;
    }

    saveMutation.mutate({
      voyageData: formData,
      steps,
    });
  };

  const handleAddStep = (mode, ruleToClone = null) => {
    setShowAddModal(false);

    if (mode === 'new') {
      // Add a blank step for editing
      setEditingStepIndex(steps.length);
      setSteps([...steps, {
        _isNew: true,
        name: '',
        icon: '📍',
        conditions: { type: 'location_visit', params: { scope: 'any', comparison: '>=', value: 1 } },
        awards: [],
      }]);
    } else if (mode === 'clone' && ruleToClone) {
      // Clone the rule (remove id so it creates a new one)
      const clonedStep = {
        ...ruleToClone,
        id: undefined,
        _isNew: true,
        _clonedFrom: ruleToClone.id,
        name: `${ruleToClone.name} (Copy)`,
        rulesetId: undefined,
      };
      setEditingStepIndex(steps.length);
      setSteps([...steps, clonedStep]);
    }
  };

  const handleSaveStep = (stepData) => {
    const newSteps = [...steps];
    newSteps[editingStepIndex] = {
      ...newSteps[editingStepIndex],
      ...stepData,
      _isNew: false,
    };
    setSteps(newSteps);
    setEditingStepIndex(null);
  };

  const handleCancelStepEdit = () => {
    // If it was a new unsaved step, remove it
    if (steps[editingStepIndex]?._isNew) {
      setSteps(steps.filter((_, i) => i !== editingStepIndex));
    }
    setEditingStepIndex(null);
  };

  const handleDeleteStep = (index) => {
    if (window.confirm('Delete this step? This cannot be undone.')) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...steps];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 max-w-4xl lg:pr-4">
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
                Progression Type
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
          <p className="text-sm text-gray-500 mb-4">What customers see in the app</p>

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

        {/* Steps Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Voyage Steps</h2>
              <p className="text-sm text-gray-500">
                {formData.chainType === 'sequential'
                  ? 'Customers must complete steps in order'
                  : 'Customers can complete steps in any order'}
              </p>
            </div>
            <span className="text-sm text-gray-500">{steps.length} steps</span>
          </div>

          {errors.steps && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.steps}</p>
          )}

          {/* Steps list */}
          {editingStepIndex === null ? (
            <div className="space-y-4">
              {steps.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <span className="text-5xl">🗺️</span>
                  <p className="mt-4 text-gray-600 font-medium">No steps yet</p>
                  <p className="text-sm text-gray-500">Add steps to build your voyage journey</p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <StepCard
                    key={step.id || `new-${index}`}
                    step={step}
                    index={index}
                    total={steps.length}
                    isSequential={formData.chainType === 'sequential'}
                    onEdit={(i) => setEditingStepIndex(i)}
                    onDelete={handleDeleteStep}
                    onMoveUp={(i) => handleMoveStep(i, -1)}
                    onMoveDown={(i) => handleMoveStep(i, 1)}
                  />
                ))
              )}

              {/* Add step button */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium"
              >
                + Add Step
              </button>
            </div>
          ) : (
            /* Step editor */
            <StepBuilder
              step={steps[editingStepIndex]}
              stepNumber={editingStepIndex + 1}
              onChange={(data) => {
                const newSteps = [...steps];
                newSteps[editingStepIndex] = { ...newSteps[editingStepIndex], ...data };
                setSteps(newSteps);
              }}
              onSave={handleSaveStep}
              onCancel={handleCancelStepEdit}
            />
          )}
        </section>

        {/* Voyage Time Bounds */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voyage Scheduling</h2>

          <div className="space-y-6">
            {/* Voyage dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Time limit */}
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
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                  <select
                    value={formData.timeLimitUnit}
                    onChange={(e) => setFormData({ ...formData, timeLimitUnit: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                  <span className="text-sm text-gray-500">from first step completion</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Display Options */}
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
              <span className="text-gray-700">Show locked steps (for sequential voyages)</span>
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
                disabled={saveMutation.isPending || editingStepIndex !== null}
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

        {/* Add Step Modal */}
        {showAddModal && (
          <AddStepModal
            onClose={() => setShowAddModal(false)}
            onCreateNew={() => handleAddStep('new')}
            onCloneRule={(rule) => handleAddStep('clone', rule)}
            existingRuleIds={steps.filter(s => s.id).map(s => s.id)}
          />
        )}
      </div>

      {/* Walkthrough Drawer */}
      <WalkthroughDrawer
        isVoyage={true}
        voyageName={formData.name}
        voyageIcon={formData.icon}
        voyageDescription={formData.description}
        sequenceType={formData.chainType === 'sequential' ? 'ordered' : 'unordered'}
        steps={steps}
        locations={locations}
        locationGroups={locationGroups}
      />
    </div>
  );
}
