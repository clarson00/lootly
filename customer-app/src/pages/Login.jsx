import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    setError('');
  };

  const handleSendCode = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.requestCode(`+1${digits}`);
      setStep('code');
    } catch (err) {
      setError(err.error?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const digits = phone.replace(/\D/g, '');
      const result = await login(`+1${digits}`, code);
      // New users go to notification preferences, returning users to discover
      if (result?.isNewUser) {
        navigate('/notifications');
      } else {
        navigate('/discover');
      }
    } catch (err) {
      setError(err.error?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col p-6">
      {/* Back button */}
      <button
        onClick={() => step === 'code' ? setStep('phone') : navigate('/')}
        className="text-gray-400 mb-8"
      >
        ← Back
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Icon */}
        <div className="text-5xl text-center mb-6">
          {step === 'phone' ? '🏴‍☠️' : '🔐'}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          {step === 'phone' ? 'Your Pirate ID' : 'Enter code'}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-center mb-8">
          {step === 'phone'
            ? "Your phone number is your ID for all treasure and game events"
            : `Code sent to ${phone}`}
        </p>

        {/* Input */}
        {step === 'phone' ? (
          <div className="mb-6">
            <div className="flex items-center bg-dark-light rounded-xl p-4">
              <span className="text-gray-400 mr-2">+1</span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="flex-1 bg-transparent text-white text-lg outline-none"
                autoFocus
              />
            </div>
            {/* Notification reassurance */}
            <p className="text-gray-500 text-xs text-center mt-3 flex items-center justify-center gap-2">
              <span>🔔</span>
              Next, you'll choose notification preferences. We don't spam.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              placeholder="1234"
              className="w-full bg-dark-light rounded-xl p-4 text-white text-3xl text-center tracking-widest outline-none"
              autoFocus
            />
            <p className="text-gray-500 text-sm text-center mt-3">
              Hint: Use code 1234
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={step === 'phone' ? handleSendCode : handleVerifyCode}
          disabled={loading}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl text-lg
                     hover:bg-yellow-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : (step === 'phone' ? 'Send Code' : 'Verify')}
        </button>
      </div>
    </div>
  );
}
