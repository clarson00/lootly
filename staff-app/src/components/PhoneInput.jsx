import { useState, useEffect } from 'react';

// Format phone number as (XXX) XXX-XXXX
function formatPhone(digits) {
  if (!digits) return '';
  const cleaned = digits.replace(/\D/g, '').slice(0, 10);

  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

export default function PhoneInput({ onSubmit, onCancel, loading = false }) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');

  const handleKeyPress = (key) => {
    setError('');
    if (key === 'backspace') {
      setDigits(prev => prev.slice(0, -1));
    } else if (key === 'clear') {
      setDigits('');
    } else if (digits.length < 10) {
      setDigits(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    if (digits.length < 10) {
      setError('Please enter a complete phone number');
      return;
    }
    onSubmit(digits);
  };

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('backspace');
      } else if (e.key === 'Enter' && digits.length === 10) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits]);

  const NumButton = ({ value, label, className = '' }) => (
    <button
      type="button"
      onClick={() => handleKeyPress(value)}
      disabled={loading}
      className={`w-16 h-16 rounded-xl font-bold text-2xl
                  bg-dark-light text-white border border-gray-700
                  hover:bg-gray-700 active:scale-95 transition-all
                  disabled:opacity-50 ${className}`}
    >
      {label || value}
    </button>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Phone Number Display */}
      <div className="w-full max-w-xs mb-4">
        <div className="bg-dark-light rounded-xl p-4 text-center border border-gray-700">
          <span className={`text-2xl font-mono tracking-wide ${digits ? 'text-white' : 'text-gray-500'}`}>
            {formatPhone(digits) || '(___) ___-____'}
          </span>
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <NumButton value="1" />
        <NumButton value="2" />
        <NumButton value="3" />
        <NumButton value="4" />
        <NumButton value="5" />
        <NumButton value="6" />
        <NumButton value="7" />
        <NumButton value="8" />
        <NumButton value="9" />
        <button
          type="button"
          onClick={() => handleKeyPress('clear')}
          disabled={loading}
          className="w-16 h-16 rounded-xl font-bold text-lg
                     bg-red-900/30 text-red-400 border border-red-800
                     hover:bg-red-900/50 active:scale-95 transition-all
                     disabled:opacity-50"
        >
          CLR
        </button>
        <NumButton value="0" />
        <button
          type="button"
          onClick={() => handleKeyPress('backspace')}
          disabled={loading}
          className="w-16 h-16 rounded-xl font-bold text-2xl
                     bg-dark-light text-gray-400 border border-gray-700
                     hover:bg-gray-700 active:scale-95 transition-all
                     disabled:opacity-50"
        >
          ⌫
        </button>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || digits.length < 10}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl
                     hover:bg-emerald-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Looking up...
            </>
          ) : (
            <>
              <span>🔍</span>
              Find Customer
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full text-gray-400 hover:text-white py-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
