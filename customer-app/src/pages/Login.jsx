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

  const handleSendCode = () => {
    // Demo mode: skip validation, go straight to notifications
    navigate('/notifications');
  };

  const handleVerifyCode = async () => {
    if (code.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    // Demo mode: accept any 4-digit code
    // New users go to notification preferences
    navigate('/notifications');
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <button
        onClick={() => step === 'code' ? setStep('phone') : navigate('/')}
        className="text-gray-400 mb-8 flex items-center gap-2 hover:text-white transition-colors relative z-10"
      >
        <span>←</span> Back
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        {/* Icon */}
        <div className="text-6xl text-center mb-6">
          {step === 'phone' ? (
            <span className="float inline-block">🏴‍☠️</span>
          ) : (
            <span className="treasure-bounce inline-block">🔐</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          {step === 'phone' ? 'Your Pirate ID' : 'Enter Code'}
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
            <div className="flex items-center bg-dark-light rounded-2xl p-4 border border-gray-700 focus-within:border-primary/50 transition-colors">
              <span className="text-gray-400 mr-3 text-lg">🇺🇸 +1</span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="flex-1 bg-transparent text-white text-xl outline-none"
                autoFocus
              />
            </div>
            {/* Notification reassurance */}
            <div className="mt-4 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <p className="text-secondary text-xs text-center flex items-center justify-center gap-2">
                <span>🔔</span>
                Next, you'll choose notification preferences. We don't spam.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            {/* Simple code input for demo */}
            <div className="flex items-center justify-center bg-dark-light rounded-2xl p-4 border border-gray-700 focus-within:border-primary/50 transition-colors">
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={handleCodeChange}
                placeholder="1234"
                maxLength={4}
                className="bg-transparent text-white text-3xl text-center outline-none w-32 tracking-widest font-bold"
                autoFocus
              />
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">
              Enter any 4-digit code
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={step === 'phone' ? handleSendCode : handleVerifyCode}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-yellow-400 text-dark font-bold py-4 rounded-2xl text-lg
                     hover:from-yellow-400 hover:to-primary active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Loading...
            </span>
          ) : (
            step === 'phone' ? 'Send Code' : 'Verify & Continue'
          )}
        </button>

        {/* Resend code */}
        {step === 'code' && (
          <button
            onClick={() => setStep('phone')}
            className="text-gray-500 text-sm mt-4 hover:text-primary transition-colors text-center"
          >
            Didn't get a code? <span className="underline">Try again</span>
          </button>
        )}
      </div>
    </div>
  );
}
