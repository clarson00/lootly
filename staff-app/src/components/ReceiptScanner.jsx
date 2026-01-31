import { useState, useRef, useEffect } from 'react';
import { scanReceipt, terminateWorker, preloadWorker } from '../lib/receiptOcr';

export default function ReceiptScanner({ onResult, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('initializing'); // initializing | ready | scanning | error
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Preload the OCR worker in background
    preloadWorker();
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setStatus('ready');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant camera permission.');
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    terminateWorker();
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus('scanning');
    setError('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame
      ctx.drawImage(video, 0, 0);

      // Get image as blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      // Run OCR
      const result = await scanReceipt(blob);

      if (result.amount !== null) {
        setScanResult(result);
        setStatus('ready');
      } else {
        setError('Could not find total amount. Try again or enter manually.');
        setStatus('ready');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Scan failed. Please try again.');
      setStatus('ready');
    }
  };

  const handleConfirm = () => {
    if (scanResult?.amount) {
      onResult(scanResult.amount);
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError('');
  };

  // Show result confirmation screen
  if (scanResult?.amount) {
    return (
      <div className="fixed inset-0 bg-dark z-50 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white text-center">Receipt Scanned</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-gray-400 mb-2">Detected Amount:</div>
          <div className="text-5xl font-bold text-white mb-4">
            ${scanResult.amount.toFixed(2)}
          </div>

          {scanResult.confidence < 0.7 && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-yellow-400 text-sm text-center">
                Low confidence reading. Please verify the amount is correct.
              </p>
            </div>
          )}

          <p className="text-gray-500 text-sm text-center">
            {scanResult.matchedText}
          </p>
        </div>

        <div className="p-4 space-y-3 border-t border-gray-800">
          <button
            onClick={handleConfirm}
            className="w-full bg-primary text-dark font-bold py-4 rounded-xl
                       hover:bg-emerald-400 active:scale-95 transition-all"
          >
            Use ${scanResult.amount.toFixed(2)}
          </button>
          <button
            onClick={handleRetry}
            className="w-full bg-dark-light text-white font-semibold py-3 rounded-xl
                       border border-gray-700 hover:bg-gray-700 transition-all"
          >
            Scan Again
          </button>
          <button
            onClick={onCancel}
            className="w-full text-gray-400 hover:text-white py-2 transition-colors"
          >
            Enter Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        <h2 className="text-lg font-semibold text-white">Scan Receipt</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {status === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📷</div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4/5 h-1/3 border-2 border-primary/50 rounded-lg">
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                    Position receipt total in frame
                  </span>
                </div>
              </div>
            </div>

            {/* Scanning overlay */}
            {status === 'scanning' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-white">Reading receipt...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Error message */}
      {error && status === 'ready' && (
        <div className="bg-red-900/30 p-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-dark-light border-t border-gray-800">
        <p className="text-gray-400 text-xs text-center mb-4">
          Tips: Good lighting helps. Focus on the "Total" line.
        </p>

        {/* Capture Button */}
        <button
          onClick={captureAndScan}
          disabled={status !== 'ready'}
          className="w-full bg-primary text-dark font-bold py-4 rounded-xl
                     hover:bg-emerald-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          <span className="text-2xl">📷</span>
          {status === 'scanning' ? 'Scanning...' : 'Capture Receipt'}
        </button>
      </div>
    </div>
  );
}
