import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/voyages', icon: '🗺️', label: 'Map' },
  { path: '/code', icon: '📱', label: 'Code' },
  { path: '/rewards', icon: '🎁', label: 'Loot' },
  { path: '/profile', icon: '👤', label: 'Crew' }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path matches (including sub-paths for rewards and voyages)
  const isActive = (path) => {
    if (path === '/rewards') {
      return location.pathname.startsWith('/rewards');
    }
    if (path === '/voyages') {
      return location.pathname.startsWith('/voyages');
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-light border-t border-gray-800 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all
              ${isActive(item.path)
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
