import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AddStepModal({ onClose, onCreateNew, onCloneRule, existingRuleIds = [] }) {
  const { businessId } = useAdminAuth();
  const [mode, setMode] = useState(null); // null, 'new', 'clone'
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['rules', businessId],
    queryFn: () => api.getRules(businessId),
    enabled: !!businessId && mode === 'clone',
  });

  // Filter out rules that are already steps in this voyage
  const availableRules = (rulesData?.data?.rules || []).filter(
    (rule) => !existingRuleIds.includes(rule.id)
  );

  const filteredRules = availableRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.plainLanguage && rule.plainLanguage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClone = () => {
    if (selectedRule) {
      onCloneRule(selectedRule);
    }
  };

  if (mode === null) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Step</h2>
          <p className="text-gray-500 mb-6">How would you like to create this step?</p>

          <div className="space-y-3">
            <button
              onClick={() => onCreateNew()}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">✨</span>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-700">
                    Create New Step
                  </p>
                  <p className="text-sm text-gray-500">
                    Start fresh with a blank step
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('clone')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">📋</span>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-700">
                    Clone Existing Rule
                  </p>
                  <p className="text-sm text-gray-500">
                    Start from an existing rule as a template
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'clone') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clone Existing Rule</h2>
            <p className="text-gray-500 text-sm">
              Select a rule to use as a starting template. A copy will be created for this voyage.
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rules..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {!isLoading && filteredRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No matching rules found' : 'No rules available to clone'}
              </div>
            )}

            {!isLoading && filteredRules.length > 0 && (
              <div className="space-y-2">
                {filteredRules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedRule?.id === rule.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rule.icon || '📜'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{rule.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {rule.plainLanguage || 'No description'}
                        </p>
                        {rule.rulesetId && (
                          <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Part of another voyage
                          </span>
                        )}
                      </div>
                      {selectedRule?.id === rule.id && (
                        <span className="text-primary-600 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => setMode(null)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleClone}
              disabled={!selectedRule}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clone & Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
