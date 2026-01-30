import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import RewardCard from '../components/RewardCard';

export default function Rewards() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const result = await api.getRewards('biz_pilot');
      setRewards(result.data);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const availableList = rewards?.available_rewards || [];
  const lockedList = rewards?.locked_rewards || [];
  const unlockedList = rewards?.unlocked_rewards || [];
  const allAvailable = [...availableList, ...lockedList];

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-2">Rewards</h1>
      <p className="text-gray-400 mb-6">
        {rewards?.points_balance || 0} pts available
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('available')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            tab === 'available'
              ? 'bg-primary text-dark'
              : 'bg-dark-light text-gray-400'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setTab('unlocked')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all relative ${
            tab === 'unlocked'
              ? 'bg-primary text-dark'
              : 'bg-dark-light text-gray-400'
          }`}
        >
          My Rewards
          {unlockedList.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unlockedList.length}
            </span>
          )}
        </button>
      </div>

      {/* Rewards List */}
      {tab === 'available' ? (
        <div className="space-y-4">
          {allAvailable.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No rewards available yet
            </div>
          ) : (
            allAvailable.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                pointsBalance={rewards.points_balance}
                onClick={() => navigate(`/rewards/${reward.id}`)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {unlockedList.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p className="text-4xl mb-4">🎁</p>
              <p>No rewards unlocked yet</p>
              <p className="text-sm mt-2">Earn points to unlock rewards!</p>
            </div>
          ) : (
            unlockedList.map(reward => (
              <RewardCard
                key={reward.customer_reward_id || reward.id}
                reward={reward}
                pointsBalance={rewards.points_balance}
                isUnlocked={true}
                onClick={() => navigate(`/rewards/${reward.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
