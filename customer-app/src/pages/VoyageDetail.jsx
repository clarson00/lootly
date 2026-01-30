import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';

function StepCard({ step, index, isLast }) {
  const getStatusIcon = () => {
    if (step.isCompleted) return '✅';
    if (step.isLocked) return '🔒';
    return '⭐';
  };

  const getStatusColor = () => {
    if (step.isCompleted) return 'border-secondary bg-secondary/10';
    if (step.isLocked) return 'border-gray-700 bg-gray-800/50 opacity-60';
    return 'border-primary/50 bg-primary/10';
  };

  const formatAward = (award) => {
    switch (award.type) {
      case 'bonus_points':
        return `+${award.value} doubloons`;
      case 'multiplier':
        return `${award.value}x point multiplier`;
      case 'unlock_reward':
        return 'Unlock special reward';
      case 'apply_tag':
        return `Earn "${award.tag}" badge`;
      default:
        return 'Mystery reward';
    }
  };

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-6 top-14 w-0.5 h-full -mb-4 ${
            step.isCompleted ? 'bg-secondary' : 'bg-gray-700'
          }`}
        />
      )}

      <div className={`relative rounded-xl border p-4 ${getStatusColor()}`}>
        <div className="flex items-start gap-4">
          {/* Step number/status */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl
              ${step.isCompleted ? 'bg-secondary text-dark' : 'bg-dark-light text-gray-400'}`}
          >
            {getStatusIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{step.icon}</span>
              <h3 className="font-semibold text-white">{step.name}</h3>
            </div>

            {step.description && !step.isLocked && (
              <p className="text-gray-400 text-sm mt-1">{step.description}</p>
            )}

            {step.isLocked && (
              <p className="text-gray-500 text-sm mt-1 italic">
                Complete the previous step to unlock
              </p>
            )}

            {/* Awards preview */}
            {step.awards && step.awards.length > 0 && !step.isLocked && (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.awards.map((award, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-amber-900/50 text-amber-400 rounded-full"
                  >
                    {formatAward(award)}
                  </span>
                ))}
              </div>
            )}

            {/* Completion date */}
            {step.isCompleted && step.completedAt && (
              <p className="text-secondary text-xs mt-2">
                Completed {new Date(step.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VoyageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voyage, setVoyage] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVoyage();
  }, [id]);

  async function loadVoyage() {
    try {
      const result = await api.getVoyage('biz_pilot', id);
      setVoyage(result.data.voyage);
      setSteps(result.data.steps || []);
      setProgress(result.data.progress);
    } catch (err) {
      setError(err.error?.message || 'Failed to load voyage');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartVoyage() {
    setStarting(true);
    try {
      await api.startVoyage('biz_pilot', id);
      await loadVoyage();
    } catch (err) {
      setError(err.error?.message || 'Failed to start voyage');
    } finally {
      setStarting(false);
    }
  }

  const themeColors = {
    voyage: 'from-blue-900 to-blue-800',
    treasure_hunt: 'from-amber-900 to-amber-800',
    quest: 'from-purple-900 to-purple-800',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧭</div>
          <p className="text-primary">Loading voyage...</p>
        </div>
      </div>
    );
  }

  if (error || !voyage) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-6xl mb-4">💀</div>
          <p className="text-red-500 mb-4">{error || 'Voyage not found'}</p>
          <button
            onClick={() => navigate('/voyages')}
            className="text-primary"
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  const bgClass = themeColors[voyage.theme] || themeColors.voyage;

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-br ${bgClass} px-4 pt-6 pb-8`}>
        {/* Back button */}
        <button
          onClick={() => navigate('/voyages')}
          className="text-white/80 hover:text-white mb-4 flex items-center gap-1"
        >
          <span>&larr;</span> Back to Map
        </button>

        <div className="flex items-start gap-4">
          <div className="text-5xl">{voyage.icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{voyage.name}</h1>
            {voyage.tagline && (
              <p className="text-white/70 italic mt-1">{voyage.tagline}</p>
            )}
          </div>
        </div>

        {/* Narrative intro */}
        {voyage.narrativeIntro && progress?.status !== 'completed' && (
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            {voyage.narrativeIntro}
          </p>
        )}

        {/* Narrative complete */}
        {voyage.narrativeComplete && progress?.status === 'completed' && (
          <p className="mt-4 text-secondary text-sm leading-relaxed">
            {voyage.narrativeComplete}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              {progress?.status === 'completed' ? 'Voyage Complete!' : 'Progress'}
            </span>
            <span className="text-white font-medium">
              {progress?.completedSteps || 0}/{progress?.totalSteps || 0}
            </span>
          </div>
          <ProgressBar
            current={progress?.completedSteps || 0}
            max={progress?.totalSteps || 1}
            showLabel={false}
          />
        </div>

        {/* Time limit */}
        {voyage.timeLimitValue && progress?.expiresAt && progress?.status === 'in_progress' && (
          <div className="mt-4 flex items-center gap-2 text-amber-300 text-sm">
            <span>⏰</span>
            <span>
              Complete by: {new Date(progress.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Start voyage button */}
        {progress?.status === 'not_started' && (
          <button
            onClick={handleStartVoyage}
            disabled={starting}
            className="w-full bg-primary text-dark font-bold py-4 rounded-xl mb-6
                       hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50"
          >
            {starting ? 'Setting Sail...' : '⚓ Begin Voyage'}
          </button>
        )}

        {/* Completed celebration */}
        {progress?.status === 'completed' && (
          <div className="bg-secondary/20 border border-secondary/50 rounded-xl p-4 mb-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-secondary font-bold text-lg">Voyage Conquered!</h3>
            <p className="text-gray-400 text-sm mt-1">
              Completed on {new Date(progress.completedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Steps */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Voyage Steps
          </h2>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No steps in this voyage yet.</p>
            </div>
          )}
        </section>

        {/* Chain type indicator */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          {voyage.chainType === 'sequential' ? (
            <p>Complete steps in order to progress</p>
          ) : (
            <p>Complete steps in any order</p>
          )}
        </div>
      </div>
    </div>
  );
}
