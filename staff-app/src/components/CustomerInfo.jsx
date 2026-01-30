export default function CustomerInfo({ customer, enrollment }) {
  return (
    <div className="bg-dark-light rounded-2xl p-6">
      {/* Customer name/status */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
          {customer?.name ? customer.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {customer?.name || 'New Customer'}
          </h2>
          <p className="text-gray-400 text-sm">{customer?.phone || 'No phone'}</p>
        </div>
      </div>

      {/* Points Balance */}
      <div className="bg-dark rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Points Balance</span>
          <span className="text-primary font-bold text-2xl">
            {enrollment?.points_balance || 0}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Earned</p>
          <p className="text-white font-semibold">
            {enrollment?.total_points_earned || 0} pts
          </p>
        </div>
        <div className="bg-dark rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-white font-semibold">
            ${enrollment?.total_spend?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Multiplier badge */}
      {enrollment?.points_multiplier > 1 && (
        <div className="mt-4 bg-secondary/20 rounded-xl p-3 text-center">
          <span className="text-secondary font-semibold">
            {enrollment.points_multiplier}x Points Multiplier Active!
          </span>
        </div>
      )}
    </div>
  );
}
