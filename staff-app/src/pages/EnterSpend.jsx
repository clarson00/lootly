import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import NumPad from '../components/NumPad';
import ReceiptScanner from '../components/ReceiptScanner';

export default function EnterSpend() {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const { qrCode, customer, enrollment } = location.state || {};

  if (!qrCode || !customer) {
    navigate('/scan');
    return null;
  }

  const handleDigit = (digit) => {
    setAmount(prev => {
      if (prev === '0') return digit;
      return prev + digit;
    });
    setError('');
  };

  const handleDecimal = () => {
    if (!amount.includes('.')) {
      setAmount(prev => prev + '.');
    }
  };

  const handleClear = () => {
    setAmount('0');
    setError('');
  };

  const handleBackspace = () => {
    setAmount(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleReceiptScan = (scannedAmount) => {
    setAmount(scannedAmount.toFixed(2));
    setShowScanner(false);
    setError('');
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.recordVisit(qrCode, numAmount);
      navigate('/confirm', {
        state: {
          transaction: result.data.transaction,
          customer: result.data.customer,
          newBalance: result.data.customer_new_balance,
          multiplier: result.data.customer_multiplier,
          milestonesUnlocked: result.data.milestones_unlocked
        }
      });
    } catch (err) {
      setError(err.error?.message || 'Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const pointsToEarn = Math.floor(numAmount * (enrollment?.points_multiplier || 1));

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 mb-2"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-white">Enter Spend Amount</h1>
        <p className="text-gray-400">{customer.name || 'Customer'}</p>
      </div>

      {/* Amount Display */}
      <div className="p-6 text-center">
        <div className="text-6xl font-bold text-white mb-2">
          ${amount}
        </div>
        <div className="text-primary text-xl">
          +{pointsToEarn} pts
          {enrollment?.points_multiplier > 1 && (
            <span className="text-secondary ml-2">
              ({enrollment.points_multiplier}x boost!)
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-center px-6">{error}</p>
      )}

      {/* Numpad */}
      <div className="flex-1 p-4">
        <NumPad
          onDigit={handleDigit}
          onDecimal={handleDecimal}
          onClear={handleClear}
          onBackspace={handleBackspace}
        />

        {/* Scan Receipt Option */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowScanner(true)}
            className="w-full flex items-center justify-center gap-3 py-3
                       bg-dark-light text-gray-300 rounded-xl border border-gray-700
                       hover:border-primary hover:text-white transition-all"
          >
            <span className="text-xl">📷</span>
            <span>Scan Receipt Instead</span>
          </button>
          <p className="text-gray-500 text-xs text-center mt-2">
            Auto-read total from receipt
          </p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-6 border-t border-gray-800">
        <button
          onClick={handleConfirm}
          disabled={loading || numAmount <= 0}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                     hover:bg-emerald-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : `Confirm $${numAmount.toFixed(2)}`}
        </button>
      </div>

      {/* Receipt Scanner Modal */}
      {showScanner && (
        <ReceiptScanner
          onResult={handleReceiptScan}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
