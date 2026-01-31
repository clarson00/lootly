import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-10 text-4xl opacity-20 float" style={{ animationDelay: '0.5s' }}>⚓</div>
        <div className="absolute bottom-1/4 left-10 text-3xl opacity-20 float" style={{ animationDelay: '1s' }}>🪙</div>
        <div className="absolute top-1/3 left-1/4 text-2xl opacity-10 float" style={{ animationDelay: '1.5s' }}>💎</div>
      </div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="text-8xl mb-6 float">
          🏴‍☠️
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2 text-gold-gradient">
          Rewards Pirate
        </h1>

        {/* Tagline */}
        <p className="text-gray-300 text-lg mb-6">
          Earn treasure at local businesses
        </p>

        {/* Value props */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-10">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span className="text-xl">🪙</span>
            <span className="text-sm">Earn Doubloons</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span className="text-xl">💎</span>
            <span className="text-sm">Claim Treasure</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span className="text-xl">🗺️</span>
            <span className="text-sm">Complete Voyages</span>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-xs bg-gradient-to-r from-primary to-yellow-400 text-dark font-bold py-4 px-8 rounded-2xl text-lg
                     hover:from-yellow-400 hover:to-primary active:scale-95 transition-all pulse-glow
                     shadow-lg shadow-primary/25"
        >
          Join the Crew
        </button>

        {/* Already have account */}
        <button
          onClick={() => navigate('/login')}
          className="text-gray-500 text-sm mt-4 hover:text-primary transition-colors"
        >
          Already a pirate? <span className="underline">Sign in</span>
        </button>

        {/* Footer text */}
        <p className="text-gray-600 text-xs mt-16 flex items-center justify-center gap-2">
          <span>📱</span>
          No app store needed • Works on any phone
        </p>
      </div>
    </div>
  );
}
