import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

function VoyageCard({ voyage, onToggle, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{voyage.icon || '🗺️'}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{voyage.name}</h3>
            {voyage.displayName && (
              <p className="text-sm text-gray-500">{voyage.displayName}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggle(voyage)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            voyage.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {voyage.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {voyage.tagline && (
        <p className="mt-3 text-sm text-gray-600 italic">{voyage.tagline}</p>
      )}

      <div className="mt-4 flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-500">Rules:</span>{' '}
          <span className="font-medium">{voyage.rulesCount || 0}</span>
          {voyage.activeRulesCount > 0 && (
            <span className="text-green-600 ml-1">
              ({voyage.activeRulesCount} active)
            </span>
          )}
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Type:</span>{' '}
          <span className="font-medium capitalize">{voyage.chainType || 'parallel'}</span>
        </div>
      </div>

      {voyage.timeLimitValue && (
        <div className="mt-2 text-sm text-gray-500">
          Time limit: {voyage.timeLimitValue} {voyage.timeLimitUnit}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            voyage.theme === 'voyage'
              ? 'bg-blue-100 text-blue-700'
              : voyage.theme === 'treasure_hunt'
              ? 'bg-amber-100 text-amber-700'
              : voyage.theme === 'quest'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {voyage.theme || 'voyage'}
        </span>
        <div className="flex gap-2">
          <Link
            to={`/voyages/${voyage.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(voyage)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VoyagesPage() {
  const { businessId } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['rulesets', businessId],
    queryFn: () => api.getRulesets(businessId),
    enabled: !!businessId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ voyage }) =>
      api.updateRuleset(businessId, voyage.id, { isActive: !voyage.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulesets', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ voyage }) => api.deleteRuleset(businessId, voyage.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rulesets', businessId] });
    },
  });

  const handleToggle = (voyage) => {
    toggleMutation.mutate({ voyage });
  };

  const handleDelete = (voyage) => {
    if (window.confirm(`Delete voyage "${voyage.name}"? Rules will be unlinked but not deleted.`)) {
      deleteMutation.mutate({ voyage });
    }
  };

  const voyages = data?.data?.rulesets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voyages</h1>
          <p className="text-gray-500">
            Create multi-step journeys for your customers
          </p>
        </div>
        <Link
          to="/voyages/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          + Create Voyage
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
          Failed to load voyages: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && voyages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <span className="text-6xl">🗺️</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No voyages yet</h3>
          <p className="mt-2 text-gray-500">
            Create your first voyage to guide customers through multi-step journeys
          </p>
          <Link
            to="/voyages/new"
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Create First Voyage
          </Link>
        </div>
      )}

      {/* Voyages grid */}
      {voyages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {voyages.map((voyage) => (
            <VoyageCard
              key={voyage.id}
              voyage={voyage}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
