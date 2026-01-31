import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NOTIFICATION_OPTIONS = [
  {
    id: 'rewards',
    label: 'Rewards & Achievements',
    description: 'When you earn rewards, unlock treasure, or complete quests',
    icon: '🏆',
    recommended: true,
    defaultOn: true
  },
  {
    id: 'quests',
    label: 'Quest Alerts',
    description: 'Streak warnings before they break, nearby alerts for quests you\'re chasing',
    icon: '🗺️',
    recommended: true,
    defaultOn: true
  },
  {
    id: 'promotions',
    label: 'Promotions & Deals',
    description: 'Special offers and bonus events from businesses you visit',
    icon: '🎁',
    recommended: false,
    defaultOn: false
  }
];

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const { updateNotificationPreferences } = useAuth();
  const [preferences, setPreferences] = useState(
    NOTIFICATION_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt.id]: opt.defaultOn }), {})
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const togglePreference = (id) => {
    setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allOff = !Object.values(preferences).some(v => v);

  const handleContinue = async () => {
    if (allOff) {
      setShowConfirmDialog(true);
      return;
    }
    await saveAndContinue();
  };

  const saveAndContinue = async () => {
    setSaving(true);
    try {
      // Save preferences (would call API in production)
      if (updateNotificationPreferences) {
        await updateNotificationPreferences(preferences);
      }

      // Request OS permission if any notifications enabled
      if (Object.values(preferences).some(v => v)) {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      navigate('/discover');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      navigate('/discover');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Set all to false and continue
    setPreferences(NOTIFICATION_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {}));
    navigate('/discover');
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col p-6">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="text-5xl text-center mb-6">🔔</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">Stay in the Loop</h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-center mb-8">
          We'll keep notifications minimal and useful.
          <br />
          <span className="text-gray-500 text-sm">You can change these anytime in Settings.</span>
        </p>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {NOTIFICATION_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => togglePreference(option.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left
                ${preferences[option.id]
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-dark-light border-gray-700 hover:border-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                  ${preferences[option.id]
                    ? 'bg-primary text-dark'
                    : 'bg-gray-700'
                  }`}
                >
                  {preferences[option.id] && <span className="text-sm">✓</span>}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-semibold text-white">{option.label}</span>
                    {option.recommended && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                     hover:bg-yellow-400 active:scale-95 transition-all
                     disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="w-full text-gray-500 py-3 text-sm hover:text-gray-400 transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-dark-light rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-3">Are you sure?</h2>
            <p className="text-gray-400 mb-4">
              Without notifications, you might miss:
            </p>
            <ul className="text-gray-400 text-sm space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span>•</span> When you earn rewards
              </li>
              <li className="flex items-center gap-2">
                <span>•</span> Streak warnings before they break
              </li>
              <li className="flex items-center gap-2">
                <span>•</span> Being near a quest location
              </li>
            </ul>
            <p className="text-gray-500 text-xs mb-6">
              You can always enable them later in Settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Enable recommended
                  setPreferences({
                    rewards: true,
                    quests: true,
                    promotions: false
                  });
                  setShowConfirmDialog(false);
                }}
                className="flex-1 bg-primary text-dark font-bold py-3 rounded-xl
                           hover:bg-yellow-400 active:scale-95 transition-all"
              >
                Enable Recommended
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  saveAndContinue();
                }}
                className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-xl
                           hover:bg-gray-600 active:scale-95 transition-all"
              >
                Continue without
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
