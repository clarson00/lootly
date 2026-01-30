import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

function StatCard({ title, value, icon, link }) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

function QuickAction({ title, description, icon, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { businessId } = useAdminAuth();

  const { data: rulesData } = useQuery({
    queryKey: ['rules', businessId],
    queryFn: () => api.getRules(businessId),
    enabled: !!businessId,
  });

  const { data: rulesetsData } = useQuery({
    queryKey: ['rulesets', businessId],
    queryFn: () => api.getRulesets(businessId),
    enabled: !!businessId,
  });

  const rulesCount = rulesData?.data?.rules?.length || 0;
  const activeRules = rulesData?.data?.rules?.filter(r => r.isActive)?.length || 0;
  const rulesetsCount = rulesetsData?.data?.rulesets?.length || 0;
  const activeRulesets = rulesetsData?.data?.rulesets?.filter(r => r.isActive)?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Manage your loyalty rules and voyages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rules"
          value={rulesCount}
          icon="📜"
          link="/rules"
        />
        <StatCard
          title="Active Rules"
          value={activeRules}
          icon="✅"
          link="/rules"
        />
        <StatCard
          title="Voyages"
          value={rulesetsCount}
          icon="🗺️"
          link="/voyages"
        />
        <StatCard
          title="Active Voyages"
          value={activeRulesets}
          icon="⚓"
          link="/voyages"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Create Rule"
            description="Add a new loyalty rule"
            icon="➕"
            to="/rules/new"
          />
          <QuickAction
            title="Create Voyage"
            description="Build a multi-step journey"
            icon="🚀"
            to="/voyages/new"
          />
          <QuickAction
            title="Test Simulator"
            description="Test rules before activation"
            icon="🧪"
            to="/simulator"
          />
        </div>
      </div>

      {/* Recent Rules */}
      {rulesData?.data?.rules?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Rules</h2>
            <Link to="/rules" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {rulesData.data.rules.slice(0, 5).map((rule) => (
              <Link
                key={rule.id}
                to={`/rules/${rule.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rule.icon || '📜'}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-500">{rule.plainLanguage}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
