import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStaffAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const result = await api.getLocations();
      setLocations(result.data.locations);
      if (result.data.locations.length > 0) {
        setSelectedLocation(result.data.locations[0].id);
      }
    } catch (err) {
      setError('Failed to load locations');
    }
  }

  const handlePinChange = (value) => {
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(selectedLocation, pin);
      navigate('/scan');
    } catch (err) {
      setError(err.error?.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            <span role="img" aria-label="staff">👨‍💼</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Lootly Staff</h1>
          <p className="text-gray-400">Sign in to record visits</p>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-dark-light rounded-xl p-4 text-white text-lg outline-none
                       appearance-none cursor-pointer border border-gray-700 focus:border-primary"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.icon} {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            maxLength={4}
            className="w-full bg-dark-light rounded-xl p-4 text-white text-3xl text-center tracking-widest
                       outline-none border border-gray-700 focus:border-primary"
            autoFocus
          />
          <p className="text-gray-500 text-sm text-center mt-3">
            Hint: Use PIN 1234
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length !== 4}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                     hover:bg-emerald-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
