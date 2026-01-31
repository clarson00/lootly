import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
  const navigate = useNavigate();
  const { customer, logout, updateCustomer } = useAuth();
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const result = await api.updateProfile({ name, email });
      updateCustomer(result.data.customer);
      setMessage('Profile saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-24 pt-6 px-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>👤</span> Captain's Profile
      </h1>

      {/* Show My Code Button */}
      <button
        onClick={() => navigate('/code')}
        className="w-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between hover:border-primary/50 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl">
            📱
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">Show My Code</p>
            <p className="text-xs text-gray-400">Scan to earn doubloons</p>
          </div>
        </div>
        <span className="text-primary text-xl">→</span>
      </button>

      {/* Profile Picture Placeholder */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-dark-light rounded-full flex items-center justify-center text-3xl border-2 border-gray-700">
          {customer?.name ? customer.name.charAt(0).toUpperCase() : '🏴‍☠️'}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-8">
        {/* Phone (read-only) */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Phone</label>
          <input
            type="tel"
            value={customer?.phone || ''}
            disabled
            className="w-full bg-dark-light rounded-xl p-4 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-dark-light rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-dark-light rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className={`text-center mb-4 ${message.includes('Failed') ? 'text-red-500' : 'text-secondary'}`}>
          {message}
        </p>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg mb-4
                   hover:bg-yellow-400 active:scale-95 transition-all
                   disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Transaction History Link */}
      <div className="bg-dark-light rounded-xl p-4 mb-4">
        <button
          onClick={() => {/* TODO: Navigate to history */}}
          className="w-full flex items-center justify-between text-white"
        >
          <span>Transaction History</span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-xl
                   hover:bg-red-500/20 active:scale-95 transition-all"
      >
        Log Out
      </button>
    </div>
  );
}
