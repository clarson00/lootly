import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import api from '../api/client';
import PhoneInput from '../components/PhoneInput';
import RecentCustomers from '../components/RecentCustomers';
import Scanner from '../components/Scanner';

export default function Scan() {
  const navigate = useNavigate();
  const { location, logout } = useStaffAuth();
  const [mode, setMode] = useState('phone'); // 'phone' | 'qr'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneLookup = async (phoneDigits) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getCustomerByPhone(phoneDigits);
      if (result.success) {
        navigate('/customer', { state: { customerData: result.data } });
      }
    } catch (err) {
      console.error('Phone lookup error:', err);
      if (err.error?.code === 'CUSTOMER_NOT_FOUND') {
        setError('Customer not found. Would you like to enroll them?');
        // Could navigate to enrollment with phone pre-filled
      } else {
        setError(err.error?.message || 'Failed to find customer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSelect = async (customer) => {
    // Use the full phone number to look up fresh customer data
    setLoading(true);
    setError('');
    try {
      const result = await api.getCustomerByPhone(customer.phone_full);
      if (result.success) {
        navigate('/customer', { state: { customerData: result.data } });
      }
    } catch (err) {
      console.error('Customer lookup error:', err);
      setError(err.error?.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = (qrCode) => {
    // Navigate to customer page with the scanned code (existing flow)
    navigate('/customer', { state: { qrCode } });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <h1 className="text-white font-semibold">{location?.name}</h1>
          <p className="text-gray-400 text-sm">{location?.icon}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          Log out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {mode === 'phone' ? (
          <>
            <h2 className="text-xl font-semibold text-white text-center mb-4">
              Find Customer
            </h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Phone Input with Numpad */}
            <div className="mb-6">
              <PhoneInput
                onSubmit={handlePhoneLookup}
                loading={loading}
              />
            </div>

            {/* Recent Customers */}
            <div className="mb-6">
              <RecentCustomers
                onSelect={handleRecentSelect}
                loading={loading}
              />
            </div>

            {/* Secondary Options */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={() => setMode('qr')}
                className="w-full flex items-center justify-center gap-2 py-3
                           bg-dark-light text-gray-300 rounded-xl border border-gray-700
                           hover:border-primary hover:text-white transition-all"
              >
                <span className="text-xl">📷</span>
                <span>Scan QR Code Instead</span>
              </button>

              {/* New Customer enrollment - future feature */}
              {/* <button
                onClick={() => navigate('/enroll')}
                className="w-full flex items-center justify-center gap-2 py-3
                           text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xl">➕</span>
                <span>New Customer</span>
              </button> */}
            </div>
          </>
        ) : (
          /* QR Scanning Mode */
          <>
            <h2 className="text-xl font-semibold text-white text-center mb-4">
              Scan Customer QR Code
            </h2>

            <div className="flex-1 flex items-center justify-center mb-4">
              <div className="w-full max-w-sm">
                <Scanner onScan={handleQrScan} />
              </div>
            </div>

            <button
              onClick={() => setMode('phone')}
              className="w-full flex items-center justify-center gap-2 py-3
                         text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Phone Lookup</span>
            </button>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => navigate('/redeem')}
          className="w-full bg-dark-light text-white font-semibold py-4 rounded-xl
                     hover:bg-gray-700 active:scale-95 transition-all border border-gray-700"
        >
          Scan Redemption Code
        </button>
      </div>
    </div>
  );
}
