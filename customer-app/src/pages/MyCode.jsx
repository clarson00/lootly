import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function MyCode() {
  const { customer } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [qrResult, enrollResult] = await Promise.all([
        api.getQRCode(),
        api.getEnrollment('biz_pilot')
      ]);
      setQrData(qrResult.data);
      setEnrollment(enrollResult.data.enrollment);
    } catch (err) {
      console.error('Failed to load QR code:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center pb-20">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-2">My Code</h1>
      <p className="text-gray-400 mb-8">Show this to the cashier</p>

      {/* QR Code Card */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl">
        {qrData?.qr_data_url ? (
          <img
            src={qrData.qr_data_url}
            alt="Your QR Code"
            className="w-64 h-64"
          />
        ) : (
          <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No QR Code</span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">Customer ID</p>
        <p className="text-white font-mono">{customer?.id || 'N/A'}</p>
      </div>

      {/* Current Balance */}
      <div className="bg-dark-light rounded-2xl p-6 w-full max-w-sm text-center">
        <p className="text-gray-400 text-sm mb-1">Current Balance</p>
        <p className="text-4xl font-bold text-primary">
          {enrollment?.points_balance || 0}
          <span className="text-lg text-gray-400 ml-2">pts</span>
        </p>
      </div>

      {/* Refresh hint */}
      <p className="text-gray-500 text-sm mt-6">
        Pull down to refresh your balance
      </p>
    </div>
  );
}
