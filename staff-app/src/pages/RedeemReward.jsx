import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Scanner from '../components/Scanner';

export default function RedeemReward() {
  const navigate = useNavigate();
  const [step, setStep] = useState('scan'); // 'scan', 'confirm', 'success'
  const [reward, setReward] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (qrCode) => {
    await verifyCode(qrCode);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a redemption code');
      return;
    }
    await verifyCode(manualCode.trim());
  };

  const verifyCode = async (code) => {
    setLoading(true);
    setError('');

    try {
      // Parse the code if it's a QR format
      let parsedCode = code;
      if (code.startsWith('lootly:redeem:')) {
        parsedCode = code.replace('lootly:redeem:', '');
      }

      const result = await api.verifyRedemption(parsedCode);
      setReward(result.data.reward);
      setCustomer(result.data.customer);
      setRedemptionCode(parsedCode);
      setStep('confirm');
    } catch (err) {
      setError(err.error?.message || 'Invalid redemption code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRedemption = async () => {
    setLoading(true);
    setError('');

    try {
      await api.redeemReward(redemptionCode);
      setStep('success');
    } catch (err) {
      setError(err.error?.message || 'Failed to redeem');
    } finally {
      setLoading(false);
    }
  };

  // Scan Step
  if (step === 'scan') {
    return (
      <div className="min-h-screen bg-dark flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => navigate('/scan')}
            className="text-gray-400 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-white">Redeem Reward</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {!manualEntry ? (
            <>
              <h2 className="text-lg text-white mb-6">
                Scan customer's redemption code
              </h2>

              <div className="w-full max-w-sm mb-6">
                <Scanner onScan={handleScan} />
              </div>

              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}

              <button
                onClick={() => setManualEntry(true)}
                className="text-gray-400 hover:text-white"
              >
                Enter code manually
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg text-white mb-6">
                Enter Redemption Code
              </h2>

              <div className="w-full max-w-sm space-y-4">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setError('');
                  }}
                  placeholder="RED_xxx..."
                  className="w-full bg-dark-light rounded-xl p-4 text-white outline-none
                             border border-gray-700 focus:border-secondary"
                  autoFocus
                />

                {error && (
                  <p className="text-red-500 text-center">{error}</p>
                )}

                <button
                  onClick={handleManualSubmit}
                  disabled={loading}
                  className="w-full bg-secondary text-dark font-bold py-4 rounded-xl
                             hover:bg-yellow-400 active:scale-95 transition-all
                             disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  onClick={() => {
                    setManualEntry(false);
                    setManualCode('');
                    setError('');
                  }}
                  className="w-full text-gray-400 hover:text-white py-2"
                >
                  Back to scanner
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Confirm Step
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-dark flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setStep('scan')}
            className="text-gray-400 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-white">Confirm Redemption</h1>
        </div>

        {/* Reward Info */}
        <div className="flex-1 p-6">
          <div className="bg-dark-light rounded-2xl p-6 text-center mb-6">
            <div className="text-6xl mb-4">{reward?.icon || '🎁'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">{reward?.name}</h2>
            <p className="text-gray-400 mb-4">{reward?.description}</p>
            <div className="text-3xl font-bold text-secondary">
              ${reward?.dollar_value?.toFixed(2)} value
            </div>
          </div>

          <div className="bg-dark-light rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Customer</p>
            <p className="text-white font-semibold">{customer?.name || 'Customer'}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center px-6">{error}</p>
        )}

        {/* Actions */}
        <div className="p-6 space-y-3 border-t border-gray-800">
          <button
            onClick={handleConfirmRedemption}
            disabled={loading}
            className="w-full bg-secondary text-dark font-bold py-4 rounded-xl text-lg
                       hover:bg-yellow-400 active:scale-95 transition-all
                       disabled:opacity-50"
          >
            {loading ? 'Redeeming...' : 'Confirm Redemption'}
          </button>

          <button
            onClick={() => setStep('scan')}
            className="w-full text-gray-400 hover:text-white py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Success Step
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <div className="text-8xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-white mb-2">Reward Redeemed!</h1>

      <div className="w-full max-w-sm bg-dark-light rounded-2xl p-6 mt-6 text-center">
        <div className="text-4xl mb-3">{reward?.icon || '🎁'}</div>
        <h2 className="text-xl font-semibold text-white mb-1">{reward?.name}</h2>
        <p className="text-secondary font-bold">
          ${reward?.dollar_value?.toFixed(2)} value
        </p>
        <p className="text-gray-400 mt-4">
          Customer: {customer?.name || 'Customer'}
        </p>
      </div>

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
