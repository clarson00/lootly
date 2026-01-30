import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';

function VoyageCard({ voyage, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-secondary';
      case 'in_progress':
        return 'text-primary';
      case 'expired':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed!';
      case 'in_progress':
        return 'In Progress';
      case 'expired':
        return 'Expired';
      default:
        return 'Not Started';
    }
  };

  const themeColors = {
    voyage: 'from-blue-900/50 to-blue-800/30 border-blue-700/50',
    treasure_hunt: 'from-amber-900/50 to-amber-800/30 border-amber-700/50',
    quest: 'from-purple-900/50 to-purple-800/30 border-purple-700/50',
  };

  const bgClass = themeColors[voyage.theme] || themeColors.voyage;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gradient-to-br ${bgClass} rounded-2xl p-5 border
                  hover:scale-[1.02] active:scale-[0.98] transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{voyage.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">{voyage.name}</h3>
          {voyage.tagline && (
            <p className="text-gray-400 text-sm mt-1 italic">{voyage.tagline}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getStatusColor(voyage.status)}`}>
            {getStatusLabel(voyage.status)}
          </span>
          <span className="text-gray-400 text-sm">
            {voyage.completedSteps}/{voyage.totalSteps} steps
          </span>
        </div>
        <ProgressBar
          current={voyage.completedSteps}
          max={voyage.totalSteps}
          showLabel={false}
        />
      </div>

      {/* Time limit indicator */}
      {voyage.timeLimitValue && voyage.status === 'in_progress' && voyage.expiresAt && (
        <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm">
          <span>⏰</span>
          <span>
            Expires: {new Date(voyage.expiresAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Completed badge */}
      {voyage.status === 'completed' && (
        <div className="mt-3 flex items-center gap-2 text-secondary">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-medium">Voyage Complete!</span>
        </div>
      )}
    </button>
  );
}

export default function TreasureMap() {
  const navigate = useNavigate();
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVoyages();
  }, []);

  async function loadVoyages() {
    try {
      const result = await api.getVoyages('biz_pilot');
      setVoyages(result.data.voyages || []);
    } catch (err) {
      setError(err.error?.message || 'Failed to load voyages');
    } finally {
      setLoading(false);
    }
  }

  const activeVoyages = voyages.filter(v => v.status === 'in_progress');
  const availableVoyages = voyages.filter(v => v.status === 'not_started');
  const completedVoyages = voyages.filter(v => v.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🗺️</div>
          <p className="text-primary">Charting yer course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚓</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadVoyages} className="text-primary">
            Try again, matey
          </button>
        </div>
      </div>
    );
  }

  if (voyages.length === 0) {
    return (
      <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Treasure Map</h1>
          <p className="text-gray-400">Yer voyages await, captain!</p>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏝️</div>
          <h3 className="text-lg font-medium text-white mb-2">
            No voyages on the horizon
          </h3>
          <p className="text-gray-400">
            Check back soon for new adventures!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🗺️</span> Treasure Map
        </h1>
        <p className="text-gray-400">Embark on voyages to earn loot!</p>
      </div>

      {/* Active Voyages */}
      {activeVoyages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span>⚔️</span> Active Voyages
          </h2>
          <div className="space-y-4">
            {activeVoyages.map(voyage => (
              <VoyageCard
                key={voyage.id}
                voyage={voyage}
                onClick={() => navigate(`/voyages/${voyage.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available Voyages */}
      {availableVoyages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🧭</span> New Adventures
          </h2>
          <div className="space-y-4">
            {availableVoyages.map(voyage => (
              <VoyageCard
                key={voyage.id}
                voyage={voyage}
                onClick={() => navigate(`/voyages/${voyage.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Voyages */}
      {completedVoyages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
            <span>🏆</span> Conquered Voyages
          </h2>
          <div className="space-y-4">
            {completedVoyages.map(voyage => (
              <VoyageCard
                key={voyage.id}
                voyage={voyage}
                onClick={() => navigate(`/voyages/${voyage.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
