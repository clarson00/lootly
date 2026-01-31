import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/discover', icon: '🔍', label: 'Discover' },
  { path: '/quests', icon: '🗺️', label: 'My Quests' },
  { path: '/rewards', icon: '🎁', label: 'Treasure' },
  { path: '/profile', icon: '👤', label: 'Captain' }
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
