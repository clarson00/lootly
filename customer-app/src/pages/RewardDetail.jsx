import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';

export default function RewardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reward, setReward] = useState(null);
  const [customerStatus, setCustomerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReward();
  }, [id]);

  async function loadReward() {
    try {
      const result = await api.getReward(id);
      setReward(result.data.reward);
      setCustomerStatus(result.data.customer_status);
    } catch (err) {
      setError(err.error?.message || 'Failed to load reward');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    setUnlocking(true);
    setError('');

    try {
      const result = await api.unlockReward(id);
      // Reload to get the updated status
      await loadReward();
    } catch (err) {
      setError(err.error?.message || 'Failed to unlock reward');
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (error && !reward) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/rewards')} className="text-primary">
            Back to rewards
          </button>
        </div>
      </div>
    );
  }

  const isUnlocked = customerStatus?.status === 'unlocked';
  const isRedeemed = customerStatus?.status === 'redeemed';

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/rewards')}
        className="text-gray-400 mb-6"
      >
        ← Back to rewards
      </button>

      {/* Reward Icon */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{reward?.icon || '🎁'}</div>
        <h1 className="text-2xl font-bold text-white mb-2">{reward?.name}</h1>
        <p className="text-gray-400">{reward?.description}</p>
      </div>

      {/* Value */}
      <div className="bg-dark-light rounded-2xl p-6 mb-6 text-center">
        <p className="text-gray-400 text-sm">Value</p>
        <p className="text-3xl font-bold text-secondary">
          ${reward?.dollar_value?.toFixed(2) || '0.00'}
        </p>
      </div>

      {/* Status-based content */}
      {isRedeemed ? (
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-gray-400">This reward has been redeemed</p>
          <p className="text-gray-500 text-sm mt-2">
            {customerStatus.redeemed_at && `on ${new Date(customerStatus.redeemed_at).toLocaleDateString()}`}
          </p>
        </div>
      ) : isUnlocked ? (
        <div className="space-y-6">
          {/* Redemption QR Code */}
          <div className="bg-white rounded-3xl p-6 text-center">
            <p className="text-gray-600 mb-4">Show this code to redeem</p>
            {customerStatus.qr_data_url ? (
              <img
                src={customerStatus.qr_data_url}
                alt="Redemption QR Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Loading QR...</span>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4 font-mono">
              {customerStatus.redemption_code}
            </p>
          </div>

          <p className="text-gray-400 text-center text-sm">
            Show this to the cashier to redeem your reward
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Points required */}
          <div className="bg-dark-light rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Points required</span>
              <span className="text-primary font-bold">{reward?.points_cost || 0} pts</span>
            </div>

            {reward?.points_cost > 0 && (
              <ProgressBar
                current={customerStatus?.points_balance || 0}
                max={reward.points_cost}
              />
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-center">{error}</p>
          )}

          {/* Unlock button */}
          {reward?.is_milestone ? (
            <div className="bg-dark-light rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-gray-400">
                This is a milestone reward. Complete the Grand Tour to unlock it!
              </p>
            </div>
          ) : (
            <button
              onClick={handleUnlock}
              disabled={unlocking || (customerStatus?.points_balance || 0) < reward?.points_cost}
              className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                         hover:bg-yellow-400 active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unlocking
                ? 'Unlocking...'
                : (customerStatus?.points_balance || 0) >= reward?.points_cost
                  ? 'Unlock Reward'
                  : `Need ${reward?.points_cost - (customerStatus?.points_balance || 0)} more pts`
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}
