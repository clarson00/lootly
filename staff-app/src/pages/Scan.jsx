import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import Scanner from '../components/Scanner';

export default function Scan() {
  const navigate = useNavigate();
  const { location, logout } = useStaffAuth();
  const [manualEntry, setManualEntry] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleScan = (qrCode) => {
    // Navigate to customer page with the scanned code
    navigate('/customer', { state: { qrCode } });
  };

  const handleManualSubmit = () => {
    if (!code.trim()) {
      setError('Please enter a customer code');
      return;
    }
    navigate('/customer', { state: { qrCode: code.trim() } });
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!manualEntry ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-6">
              Scan Customer Code
            </h2>

            <div className="w-full max-w-sm mb-6">
              <Scanner onScan={handleScan} />
            </div>

            <button
              onClick={() => setManualEntry(true)}
              className="text-gray-400 hover:text-white"
            >
              Enter code manually
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-6">
              Enter Customer Code
            </h2>

            <div className="w-full max-w-sm space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="lootly:customer:cust_xxx"
                className="w-full bg-dark-light rounded-xl p-4 text-white outline-none
                           border border-gray-700 focus:border-primary"
                autoFocus
              />

              {error && (
                <p className="text-red-500 text-center">{error}</p>
              )}

              <button
                onClick={handleManualSubmit}
                className="w-full bg-primary text-dark font-bold py-4 rounded-xl
                           hover:bg-emerald-400 active:scale-95 transition-all"
              >
                Look Up Customer
              </button>

              <button
                onClick={() => {
                  setManualEntry(false);
                  setCode('');
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

      {/* Actions */}
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
