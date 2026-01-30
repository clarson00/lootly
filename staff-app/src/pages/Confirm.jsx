import { useNavigate, useLocation } from 'react-router-dom';

export default function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    transaction,
    customer,
    newBalance,
    multiplier,
    milestonesUnlocked = []
  } = location.state || {};

  if (!transaction) {
    navigate('/scan');
    return null;
  }

  const hasMilestones = milestonesUnlocked.length > 0;

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      {/* Success Icon */}
      <div className={`text-8xl mb-6 ${hasMilestones ? 'animate-bounce' : ''}`}>
        {hasMilestones ? '🎉' : '✅'}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2">
        {hasMilestones ? 'LOOT DROP!' : 'Points Added!'}
      </h1>

      {/* Details */}
      <div className="w-full max-w-sm bg-dark-light rounded-2xl p-6 mt-6 space-y-4">
        {/* Amount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount</span>
          <span className="text-white font-semibold text-xl">
            ${transaction.spend_amount?.toFixed(2) || '0.00'}
          </span>
        </div>

        {/* Points Earned */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Points Earned</span>
          <span className="text-primary font-bold text-xl">
            +{transaction.points_earned || 0}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* New Balance */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">New Balance</span>
          <span className="text-white font-bold text-2xl">
            {newBalance || 0} pts
          </span>
        </div>

        {/* Multiplier */}
        {multiplier > 1 && (
          <div className="bg-secondary/20 rounded-xl p-3 text-center">
            <span className="text-secondary font-semibold">
              {multiplier}x Points Active!
            </span>
          </div>
        )}
      </div>

      {/* Milestones */}
      {hasMilestones && (
        <div className="w-full max-w-sm mt-6">
          <p className="text-secondary font-semibold mb-3 text-center">
            They unlocked new rewards!
          </p>
          <div className="space-y-3">
            {milestonesUnlocked.map((milestone, index) => (
              <div
                key={milestone.reward_id || index}
                className="bg-secondary/10 rounded-xl p-4 flex items-center gap-4 border border-secondary/30"
              >
                <div className="text-3xl">{milestone.reward_icon || '🎁'}</div>
                <div>
                  <p className="text-white font-semibold">{milestone.reward_name}</p>
                  <p className="text-secondary text-sm">
                    ${milestone.reward_value?.toFixed(2)} value
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer */}
      <p className="text-gray-400 mt-6">
        Customer: {customer?.name || 'Customer'}
      </p>

      {/* Done Button */}
      <button
        onClick={() => navigate('/scan')}
        className="w-full max-w-sm bg-primary text-dark font-bold py-4 rounded-xl text-lg mt-8
                   hover:bg-emerald-400 active:scale-95 transition-all"
      >
        Done
      </button>
    </div>
  );
}
