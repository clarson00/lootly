export default function ProgressBar({ current, max, label }) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div>
      <div className="h-3 bg-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <p className="text-gray-400 text-sm mt-2">{label}</p>
      )}
    </div>
  );
}
