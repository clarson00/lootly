import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Logo */}
        <div className="text-6xl mb-4">
          <span role="img" aria-label="treasure">
            💰
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-primary mb-2">
          Lootly
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-lg mb-12">
          Collect your loot!
        </p>

        {/* Get Started Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-xs bg-primary text-dark font-bold py-4 px-8 rounded-xl text-lg
                     hover:bg-yellow-400 active:scale-95 transition-all pulse-glow"
        >
          Get Started
        </button>

        {/* Footer text */}
        <p className="text-gray-500 text-sm mt-8">
          Earn rewards at your favorite places
        </p>
      </div>
    </div>
  );
}
