export default function NumPad({ onDigit, onDecimal, onClear, onBackspace }) {
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  const handleClick = (value) => {
    if (value === '.') {
      onDecimal();
    } else if (value === '⌫') {
      onBackspace();
    } else {
      onDigit(value);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Clear button */}
      <button
        onClick={onClear}
        className="w-full text-gray-400 hover:text-white py-2 mb-4"
      >
        Clear
      </button>

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-3">
        {buttons.flat().map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(value)}
            className={`
              aspect-square rounded-2xl text-3xl font-semibold
              transition-all active:scale-95
              ${value === '⌫'
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-dark-light text-white hover:bg-gray-700'
              }
            `}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
