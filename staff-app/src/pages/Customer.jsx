import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import CustomerInfo from '../components/CustomerInfo';

export default function Customer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const qrCode = location.state?.qrCode;

  useEffect(() => {
    if (!qrCode) {
      navigate('/scan');
      return;
    }
    loadCustomer();
  }, [qrCode]);

  async function loadCustomer() {
    try {
      const result = await api.getCustomer(qrCode);
      setCustomer(result.data.customer);
      setEnrollment(result.data.enrollment);
      setPendingRewards(result.data.pending_rewards || []);
    } catch (err) {
      setError(err.error?.message || 'Customer not found');
    } finally {
      setLoading(false);
    }
  }

  const handleRecordPurchase = () => {
    navigate('/spend', { state: { qrCode, customer, enrollment } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Looking up customer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-500 text-xl mb-6">{error}</p>
        <button
          onClick={() => navigate('/scan')}
          className="bg-primary text-dark font-bold py-3 px-8 rounded-xl
                     hover:bg-emerald-400 active:scale-95 transition-all"
        >
          Scan Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => navigate('/scan')}
          className="text-gray-400 mb-2"
        >
          ← Back to scan
        </button>
        <h1 className="text-xl font-semibold text-white">Customer Found</h1>
      </div>

      {/* Customer Info */}
      <div className="flex-1 p-6">
        <CustomerInfo
          customer={customer}
          enrollment={enrollment}
        />

        {/* Pending Rewards */}
        {pendingRewards.length > 0 && (
          <div className="mt-6 bg-secondary/10 rounded-xl p-4 border border-secondary/30">
            <p className="text-secondary font-semibold mb-2">
              Has {pendingRewards.length} reward{pendingRewards.length > 1 ? 's' : ''} ready!
            </p>
            <div className="space-y-2">
              {pendingRewards.map(reward => (
                <div key={reward.id} className="flex items-center gap-3">
                  <span className="text-2xl">{reward.icon}</span>
                  <span className="text-white">{reward.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3 border-t border-gray-800">
        <button
          onClick={handleRecordPurchase}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                     hover:bg-emerald-400 active:scale-95 transition-all"
        >
          Record Purchase
        </button>

        {pendingRewards.length > 0 && (
          <button
            onClick={() => navigate('/redeem', { state: { customer } })}
            className="w-full bg-secondary text-dark font-bold py-4 rounded-xl text-lg
                       hover:bg-yellow-400 active:scale-95 transition-all"
          >
            Redeem Reward
          </button>
        )}
      </div>
    </div>
  );
}
