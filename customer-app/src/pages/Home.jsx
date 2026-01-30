import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';
import LocationBadge from '../components/LocationBadge';
import PendingAwardClaim from '../components/PendingAwardClaim';

export default function Home() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAwards, setPendingAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [enrollmentResult, awardsResult] = await Promise.all([
        api.getEnrollment('biz_pilot'),
        api.getPendingAwards('biz_pilot').catch(() => ({ data: { choices: [] } })),
      ]);
      setEnrollment(enrollmentResult.data.enrollment);
      setLocations(enrollmentResult.data.locations);
      setPendingAwards(awardsResult.data?.choices || []);
    } catch (err) {
      setError(err.error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleAwardClaimed = () => {
    setSelectedAward(null);
    loadData(); // Refresh data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadData} className="text-primary">Try again</button>
        </div>
      </div>
    );
  }

  const visitedCount = locations.filter(l => l.visited).length;
  const nextRewardPoints = 100;
  const progress = enrollment ? (enrollment.points_balance / nextRewardPoints) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Hey {customer?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-400">
          {enrollment?.business_name || "Tony's Restaurant Group"}
        </p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 mb-6 border border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Your Points</span>
          {enrollment?.points_multiplier > 1 && (
            <span className="bg-primary text-dark text-xs font-bold px-2 py-1 rounded-full">
              {enrollment.points_multiplier}x BOOST
            </span>
          )}
        </div>

        <div className="text-5xl font-bold text-primary mb-4">
          {enrollment?.points_balance || 0}
          <span className="text-lg text-gray-400 ml-2">pts</span>
        </div>

        <ProgressBar
          current={enrollment?.points_balance || 0}
          max={nextRewardPoints}
          label={`${nextRewardPoints - (enrollment?.points_balance || 0)} pts to next reward`}
        />
      </div>

      {/* Locations Progress */}
      <div className="bg-dark-light rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Grand Tour Progress</h2>
          <span className="text-primary">{visitedCount}/{locations.length}</span>
        </div>

        <div className="flex justify-between gap-2 mb-4">
          {locations.map(location => (
            <LocationBadge
              key={location.id}
              icon={location.icon}
              name={location.name}
              visited={location.visited}
            />
          ))}
        </div>

        {visitedCount === locations.length ? (
          <p className="text-secondary text-center text-sm">
            Grand Tour complete! Check your rewards.
          </p>
        ) : (
          <p className="text-gray-400 text-center text-sm">
            Visit all {locations.length} locations to unlock the Grand Tour reward!
          </p>
        )}
      </div>

      {/* Pending Awards Alert */}
      {pendingAwards.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-2xl p-4 mb-6 border border-amber-500/50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl animate-bounce">🎁</span>
            <div>
              <h3 className="font-bold text-white">Loot Awaits!</h3>
              <p className="text-amber-200 text-sm">
                Ye have {pendingAwards.length} reward{pendingAwards.length > 1 ? 's' : ''} to claim!
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {pendingAwards.slice(0, 3).map((award) => (
              <button
                key={award.id}
                onClick={() => setSelectedAward(award)}
                className="w-full bg-dark/50 rounded-xl p-3 flex items-center justify-between
                           hover:bg-dark/70 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{award.ruleIcon}</span>
                  <span className="text-white font-medium">{award.ruleName}</span>
                </div>
                <span className="text-primary text-sm font-medium">Claim →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/code')}
          className="bg-primary text-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2
                     hover:bg-yellow-400 active:scale-95 transition-all"
        >
          <span className="text-xl">📱</span>
          Show My Code
        </button>

        <button
          onClick={() => navigate('/rewards')}
          className="bg-dark-light text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2
                     hover:bg-gray-700 active:scale-95 transition-all border border-gray-700"
        >
          <span className="text-xl">🎁</span>
          Rewards
        </button>
      </div>

      {/* Pending Award Claim Modal */}
      {selectedAward && (
        <PendingAwardClaim
          choice={selectedAward}
          onClaimed={handleAwardClaimed}
          onClose={() => setSelectedAward(null)}
        />
      )}
    </div>
  );
}
