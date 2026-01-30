import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onScan }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Stop scanning after successful scan
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            }).catch(console.error);
          },
          (errorMessage) => {
            // Ignore scan errors (no QR code found, etc.)
          }
        );
        setIsStarted(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        setError('Camera access denied or not available');
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && isStarted) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full aspect-square bg-dark-light rounded-2xl flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Please allow camera access to scan QR codes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        id="qr-reader"
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: '3px solid #10b981' }}
      />
      <p className="text-gray-400 text-center mt-4 text-sm">
        Position the QR code within the frame
      </p>
    </div>
  );
}
