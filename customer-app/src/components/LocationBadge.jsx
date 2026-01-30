export default function LocationBadge({ icon, name, visited }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
          transition-all ${
            visited
              ? 'bg-primary/20 border-2 border-primary'
              : 'bg-dark border-2 border-gray-700'
          }`}
      >
        {icon || '📍'}
      </div>
      <span className={`text-xs mt-1 max-w-[60px] text-center truncate ${
        visited ? 'text-primary' : 'text-gray-500'
      }`}>
        {name?.split(' ')[0] || 'Location'}
      </span>
      {visited && (
        <span className="text-secondary text-xs">✓</span>
      )}
    </div>
  );
}
