import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

function RuleCard({ rule, onToggle, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{rule.icon || '📜'}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
            {rule.rulesetId && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Part of voyage
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(rule)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              rule.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {rule.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">{rule.plainLanguage}</p>

      {rule.awards && rule.awards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rule.awards.map((award, i) => (
            <span
              key={i}
              className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
            >
              {award.type === 'bonus_points' && `+${award.value} points`}
              {award.type === 'multiplier' && `${award.value}x multiplier`}
              {award.type === 'unlock_reward' && 'Unlock reward'}
              {award.type === 'apply_tag' && `Tag: ${award.tag || award.value}`}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {rule.isRepeatable ? 'Repeatable' : 'One-time'}
          {rule.cooldownDays && ` • ${rule.cooldownDays} day cooldown`}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/rules/${rule.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(rule)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const { businessId } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['rules', businessId],
    queryFn: () => api.getRules(businessId),
    enabled: !!businessId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ rule }) =>
      api.updateRule(businessId, rule.id, { isActive: !rule.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ rule }) => api.deleteRule(businessId, rule.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', businessId] });
    },
  });

  const handleToggle = (rule) => {
    toggleMutation.mutate({ rule });
  };

  const handleDelete = (rule) => {
    if (window.confirm(`Delete rule "${rule.name}"?`)) {
      deleteMutation.mutate({ rule });
    }
  };

  const rules = data?.data?.rules || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
          <p className="text-gray-500">
            Create and manage loyalty rules for your customers
          </p>
        </div>
        <Link
          to="/rules/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          + Create Rule
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load rules: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <span className="text-6xl">📜</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No rules yet</h3>
          <p className="mt-2 text-gray-500">
            Create your first rule to start rewarding customers
          </p>
          <Link
            to="/rules/new"
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Create First Rule
          </Link>
        </div>
      )}

      {/* Rules grid */}
      {rules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
