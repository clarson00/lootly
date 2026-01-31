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
            {/* Code input boxes */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-bold
                    ${code[i] ? 'bg-primary/20 border-primary text-white' : 'bg-dark-light border-gray-700'}
                    border-2 transition-all`}
                >
                  {code[i] || ''}
                </div>
              ))}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              className="sr-only"
              autoFocus
            />
            {/* Hidden input for actual typing */}
            <div
              className="text-center cursor-text"
              onClick={() => document.querySelector('input[inputMode="numeric"]')?.focus()}
            >
              <p className="text-gray-500 text-sm">
                Tap to enter code • Hint: <span className="text-primary">1234</span>
              </p>
            </div>
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
