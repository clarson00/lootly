import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function SimulatorPage() {
  const { businessId } = useAdminAuth();

  const [selectedRuleId, setSelectedRuleId] = useState('');
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

    if (!selectedRuleId) {
      alert('Please select a rule');
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
  const rules = rulesData?.data?.rules || [];

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
              {/* Rule Selection */}
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
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.icon || '📜'} {rule.name}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={isLoading || !selectedRuleId}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Running Simulation...' : 'Run Simulation'}
              </button>
            </div>
          </section>
        </div>

        {/* Results */}
        <div>
          <section className="bg-white rounded-xl border border-gray-200 p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>

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
          </section>
        </div>
      </div>
    </div>
  );
}
