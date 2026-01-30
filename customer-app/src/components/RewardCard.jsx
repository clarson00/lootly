import ProgressBar from './ProgressBar';

export default function RewardCard({ reward, pointsBalance, isUnlocked, onClick }) {
  const canAfford = pointsBalance >= reward.points_cost;
  const isMilestone = reward.is_milestone;

  return (
    <button
      onClick={onClick}
      className="w-full bg-dark-light rounded-2xl p-4 text-left transition-all
                 hover:bg-gray-800 active:scale-98"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl">{reward.icon || '🎁'}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold">{reward.name}</h3>
            {isMilestone && (
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">
                Milestone
              </span>
            )}
          </div>

          {isUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="text-secondary text-sm font-medium">
                Ready to use!
              </span>
              <span className="text-gray-500">→</span>
            </div>
          ) : isMilestone ? (
            <p className="text-gray-400 text-sm">
              Complete the Grand Tour to unlock
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-medium">
                  {reward.points_cost} pts
                </span>
                <span className="text-gray-400 text-sm">
                  ${reward.dollar_value?.toFixed(2)} value
                </span>
              </div>

              {!canAfford && (
                <ProgressBar
                  current={pointsBalance}
                  max={reward.points_cost}
                />
              )}

              {canAfford && (
                <span className="text-secondary text-sm font-medium">
                  Tap to unlock!
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
