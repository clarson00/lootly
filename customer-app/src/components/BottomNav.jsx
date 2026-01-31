import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/discover', icon: '🔍', activeIcon: '🔍', label: 'Discover' },
  { path: '/quests', icon: '🗺️', activeIcon: '🗺️', label: 'Quests' },
  { path: '/rewards', icon: '🎁', activeIcon: '💎', label: 'Treasure' },
  { path: '/profile', icon: '👤', activeIcon: '🏴‍☠️', label: 'Captain' }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path matches (including sub-paths)
  const isActive = (path) => {
    if (path === '/rewards') {
      return location.pathname.startsWith('/rewards');
    }
    if (path === '/quests') {
      return location.pathname.startsWith('/quests') || location.pathname.startsWith('/voyages');
    }
    if (path === '/discover') {
      return location.pathname === '/discover' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-dark-light to-dark-light/95 backdrop-blur-sm border-t border-gray-800/50 safe-bottom">
      <div className="flex justify-around items-center h-18 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all relative
                ${active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-300 active:scale-95'
                }`}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-yellow-400 rounded-full" />
              )}

              <span className={`text-2xl mb-0.5 transition-transform ${active ? 'scale-110' : ''}`}>
                {active ? item.activeIcon : item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
