import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Logo */}
        <div className="text-7xl mb-6">
          🏴‍☠️
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-primary mb-2">
          Rewards Pirate
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-lg mb-4">
          Earn treasure at local businesses
        </p>

        {/* Value props */}
        <div className="flex justify-center gap-6 mb-12 text-sm text-gray-500">
          <span>🪙 Earn Doubloons</span>
          <span>💎 Claim Treasure</span>
          <span>🗺️ Complete Voyages</span>
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-xs bg-primary text-dark font-bold py-4 px-8 rounded-xl text-lg
                     hover:bg-yellow-400 active:scale-95 transition-all pulse-glow"
        >
          Join the Crew
        </button>

        {/* Already have account */}
        <button
          onClick={() => navigate('/login')}
          className="text-gray-500 text-sm mt-4 hover:text-primary transition-colors"
        >
          Already a pirate? Sign in
        </button>

        {/* Footer text */}
        <p className="text-gray-600 text-xs mt-12">
          No app store needed • Works on any phone
        </p>
      </div>
    </div>
  );
}
