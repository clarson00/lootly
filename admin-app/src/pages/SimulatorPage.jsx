import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';
import { describeConditions, describeAwards, describeAwardsAsText } from '../lib/plainLanguage';

export default function SimulatorPage() {
  const { businessId } = useAdminAuth();

  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedVoyageId, setSelectedVoyageId] = useState('');
  const [selectionType, setSelectionType] = useState('rule'); // 'rule' | 'voyage'
  const [customerId, setCustomerId] = useState('');
  const [scenario, setScenario] = useState({
    locationId: '',
    amountCents: 5000,
  });
  const [simulationType, setSimulationType] = useState('bulk');
  const [results, setResults] = useState(null);

  const { data: rulesData } = useQuery({
    queryKey: ['rules', businessId],
    queryFn: () => api.getRules(businessId),
    enabled: !!businessId,
  });

  const { data: voyagesData } = useQuery({
    queryKey: ['rulesets', businessId],
    queryFn: () => api.getRulesets(businessId),
    enabled: !!businessId,
  });

  const { data: businessData } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => api.getLocations(businessId),
    enabled: !!businessId,
  });

  const { data: selectedVoyageData } = useQuery({
    queryKey: ['ruleset', businessId, selectedVoyageId],
    queryFn: () => api.getRuleset(businessId, selectedVoyageId),
    enabled: !!businessId && !!selectedVoyageId && selectionType === 'voyage',
  });

  const rules = rulesData?.data?.rules || [];
  const voyages = voyagesData?.data?.rulesets || [];
  const standaloneRules = rules.filter(r => !r.rulesetId);
  const locations = businessData?.data?.locations || [];
  const locationGroups = businessData?.data?.locationGroups || [];

  // Get selected rule details
  const selectedRule = useMemo(() => {
    if (selectionType === 'rule' && selectedRuleId) {
      return rules.find(r => r.id === selectedRuleId);
    }
    return null;
  }, [selectionType, selectedRuleId, rules]);

  // Get selected voyage with steps
  const selectedVoyage = useMemo(() => {
    if (selectionType === 'voyage' && selectedVoyageData?.data) {
      return {
        ...selectedVoyageData.data.ruleset,
        steps: (selectedVoyageData.data.rules || []).sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0)),
      };
    }
    return null;
  }, [selectionType, selectedVoyageData]);

  const bulkMutation = useMutation({
    mutationFn: () => api.simulateBulk(businessId, selectedRuleId),
    onSuccess: (data) => setResults(data.data),
  });

  const customerMutation = useMutation({
    mutationFn: () => api.simulateCustomer(businessId, selectedRuleId, customerId),
    onSuccess: (data) => setResults(data.data),
  });

  const whatIfMutation = useMutation({
    mutationFn: () => api.simulateWhatIf(businessId, selectedRuleId, customerId, scenario),
    onSuccess: (data) => setResults(data.data),
  });

  const handleSimulate = () => {
    setResults(null);

    const ruleId = selectionType === 'rule' ? selectedRuleId : null;

    if (selectionType === 'rule' && !selectedRuleId) {
      alert('Please select a rule');
      return;
    }

    if (selectionType === 'voyage' && !selectedVoyageId) {
      alert('Please select a voyage');
      return;
    }

    // For voyages, we'd need a different API - for now just show the walkthrough
    if (selectionType === 'voyage') {
      setResults({ voyageWalkthrough: true });
      return;
    }

    switch (simulationType) {
      case 'bulk':
        bulkMutation.mutate();
        break;
      case 'customer':
        if (!customerId) {
          alert('Please enter a customer ID');
          return;
        }
        customerMutation.mutate();
        break;
      case 'whatif':
        if (!customerId) {
          alert('Please enter a customer ID');
          return;
        }
        whatIfMutation.mutate();
        break;
    }
  };

  const isLoading = bulkMutation.isPending || customerMutation.isPending || whatIfMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rule Simulator</h1>
        <p className="text-gray-500">
          Test your rules before activating them
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>

            <div className="space-y-4">
              {/* Selection Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What to Simulate
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionType('rule');
                      setSelectedVoyageId('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectionType === 'rule'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📜 Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionType('voyage');
                      setSelectedRuleId('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectionType === 'voyage'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🗺️ Voyage
                  </button>
                </div>
              </div>

              {/* Rule Selection */}
              {selectionType === 'rule' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Rule *
                  </label>
                  <select
                    value={selectedRuleId}
                    onChange={(e) => setSelectedRuleId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Choose a rule...</option>
                    {standaloneRules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.icon || '📜'} {rule.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Voyage Selection */}
              {selectionType === 'voyage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Voyage *
                  </label>
                  <select
                    value={selectedVoyageId}
                    onChange={(e) => setSelectedVoyageId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Choose a voyage...</option>
                    {voyages.map((voyage) => (
                      <option key={voyage.id} value={voyage.id}>
                        {voyage.icon || '🗺️'} {voyage.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Simulation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simulation Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="bulk"
                      checked={simulationType === 'bulk'}
                      onChange={(e) => setSimulationType(e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Bulk Simulation</p>
                      <p className="text-sm text-gray-500">Test against all customers</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="customer"
                      checked={simulationType === 'customer'}
                      onChange={(e) => setSimulationType(e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Customer Test</p>
                      <p className="text-sm text-gray-500">Test for a specific customer</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="whatif"
                      checked={simulationType === 'whatif'}
                      onChange={(e) => setSimulationType(e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">What-If Scenario</p>
                      <p className="text-sm text-gray-500">Test hypothetical actions</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Customer ID (for customer/whatif) */}
              {(simulationType === 'customer' || simulationType === 'whatif') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID *
                  </label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="cust_xxx"
                  />
                </div>
              )}

              {/* Scenario params (for whatif) */}
              {simulationType === 'whatif' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Scenario Parameters</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location ID
                    </label>
                    <input
                      type="text"
                      value={scenario.locationId}
                      onChange={(e) => setScenario({ ...scenario, locationId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="loc_xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Amount (cents)
                    </label>
                    <input
                      type="number"
                      value={scenario.amountCents}
                      onChange={(e) => setScenario({ ...scenario, amountCents: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ${(scenario.amountCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSimulate}
                disabled={isLoading || (selectionType === 'rule' && !selectedRuleId) || (selectionType === 'voyage' && !selectedVoyageId)}
                className={`w-full py-3 text-white rounded-lg font-medium disabled:opacity-50 transition-colors ${
                  selectionType === 'voyage' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? 'Running Simulation...' : 'Run Simulation'}
              </button>
            </div>
          </section>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Walkthrough Panel - Always visible when something is selected */}
          {(selectedRule || selectedVoyage) && (
            <section className={`rounded-xl border p-6 ${
              selectionType === 'voyage'
                ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${
                selectionType === 'voyage' ? 'text-purple-900' : 'text-amber-900'
              }`}>
                {selectionType === 'voyage' ? '🗺️ Voyage Walkthrough' : '📜 Rule Walkthrough'}
              </h2>

              {/* Rule Walkthrough */}
              {selectedRule && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedRule.icon || '📜'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedRule.name}</h3>
                      {selectedRule.description && (
                        <p className="text-sm text-gray-600">{selectedRule.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">When</p>
                      <p className="text-sm text-gray-800">{describeConditions(selectedRule.conditions, locations, locationGroups)}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Then</p>
                      <p className="text-sm text-gray-800">{describeAwardsAsText(selectedRule.awards, locations)}</p>
                    </div>

                    {(selectedRule.startDate || selectedRule.endDate) && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Active Period</p>
                        <p className="text-sm text-gray-800">
                          {selectedRule.startDate && `From ${new Date(selectedRule.startDate).toLocaleDateString()}`}
                          {selectedRule.startDate && selectedRule.endDate && ' '}
                          {selectedRule.endDate && `Until ${new Date(selectedRule.endDate).toLocaleDateString()}`}
                          {!selectedRule.startDate && !selectedRule.endDate && 'Always active'}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <span>{selectedRule.isRepeatable ? '🔄 Repeatable' : '1️⃣ One-time only'}</span>
                      {selectedRule.cooldownDays && <span>⏰ {selectedRule.cooldownDays} day cooldown</span>}
                      <span>{selectedRule.isActive ? '✅ Active' : '⏸️ Inactive'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Voyage Walkthrough */}
              {selectedVoyage && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedVoyage.icon || '🗺️'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedVoyage.name}</h3>
                      {selectedVoyage.description && (
                        <p className="text-sm text-gray-600">{selectedVoyage.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {selectedVoyage.sequenceType === 'ordered' ? '📍 Journey Steps (in order)' : '📍 Journey Steps (any order)'}
                    </p>

                    {selectedVoyage.steps?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedVoyage.steps.map((step, index) => (
                          <div key={step.id} className="relative pl-8">
                            {/* Step number/connector */}
                            <div className="absolute left-0 top-0 flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                                {index + 1}
                              </div>
                              {index < selectedVoyage.steps.length - 1 && (
                                <div className="w-0.5 h-full bg-purple-200 mt-1" />
                              )}
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span>{step.icon || '📍'}</span>
                                <span className="font-medium text-gray-900">{step.name}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">When:</span> {describeConditions(step.conditions, locations, locationGroups)}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Then:</span> {describeAwardsAsText(step.awards, locations)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No steps defined yet</p>
                    )}
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500 pt-2">
                    <span>{selectedVoyage.sequenceType === 'ordered' ? '📋 Sequential voyage' : '🔀 Flexible voyage'}</span>
                    <span>{selectedVoyage.isActive ? '✅ Active' : '⏸️ Inactive'}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Simulation Results */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 min-h-[300px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h2>

            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-6xl mb-4">🧪</span>
                <p>Run a simulation to see results</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {results && simulationType === 'bulk' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{results.totalCustomers}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Would Trigger</p>
                    <p className="text-2xl font-bold text-green-700">{results.wouldTrigger}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Already Triggered</p>
                    <p className="text-2xl font-bold text-gray-600">{results.alreadyTriggered}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600">In Cooldown</p>
                    <p className="text-2xl font-bold text-yellow-700">{results.inCooldown}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {Math.round((results.wouldTrigger / results.totalCustomers) * 100) || 0}% of customers
                  would trigger this rule today.
                </p>
              </div>
            )}

            {results && simulationType === 'customer' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    results.wouldTrigger ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="font-medium">
                    {results.wouldTrigger ? '✅ Would Trigger' : '❌ Would Not Trigger'}
                  </p>
                  {results.reason && (
                    <p className="text-sm mt-1 text-gray-600">{results.reason}</p>
                  )}
                </div>

                {results.plainLanguage && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Rule Description:</p>
                    <p className="text-gray-600">{results.plainLanguage}</p>
                  </div>
                )}

                {results.checks && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Checks:</p>
                    {results.checks.map((check, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span>{check.passed ? '✅' : '❌'}</span>
                        <span className={check.passed ? 'text-gray-700' : 'text-red-600'}>
                          {check.name}
                        </span>
                        {check.note && (
                          <span className="text-gray-400">- {check.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {results.awards && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium text-amber-700">Awards:</p>
                    <pre className="text-xs mt-2 text-amber-600 overflow-auto">
                      {JSON.stringify(results.awards, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {results && simulationType === 'whatif' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    results.wouldTrigger ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="font-medium">
                    {results.wouldTrigger ? '✅ Would Trigger' : '❌ Would Not Trigger'}
                  </p>
                </div>

                <p className="text-gray-600">{results.message}</p>

                {results.awards && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium text-amber-700">Awards that would be given:</p>
                    <pre className="text-xs mt-2 text-amber-600 overflow-auto">
                      {JSON.stringify(results.awards, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {results && results.voyageWalkthrough && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <span className="text-4xl mb-3">✨</span>
                <p className="font-medium">Voyage walkthrough displayed above</p>
                <p className="text-sm text-gray-400 mt-1">
                  Customer simulation for voyages coming soon!
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
