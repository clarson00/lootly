import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Rules', href: '/rules', icon: '📜' },
  { name: 'Voyages', href: '/voyages', icon: '🗺️' },
  { name: 'Simulator', href: '/simulator', icon: '🧪' },
  { name: 'Marketing', href: '/marketing', icon: '📣' },
];

const settingsNavigation = [
  { name: 'Integrations', href: '/settings/integrations', icon: '🔗' },
];

function NavItem({ item, isActive }) {
  return (
    <Link
      to={item.href}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{item.icon}</span>
      {item.name}
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const { logout, businessId } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <span className="text-3xl">🏴‍☠️</span>
            <div>
              <h1 className="font-bold text-gray-900">Rewards Pirate</h1>
              <p className="text-xs text-gray-500">Admin Console</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href)
                }
              />
            ))}

            {/* Settings Section */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Settings
              </p>
              {settingsNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={location.pathname.startsWith(item.href)}
                />
              ))}
            </div>
          </nav>

          {/* Business Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-2">
              Business: <span className="font-medium text-gray-700">{businessId}</span>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="py-8 px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
