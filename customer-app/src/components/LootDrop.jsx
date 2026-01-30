import { useEffect, useState } from 'react';

const confettiColors = ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#3b82f6'];

function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: Math.random() * 10 + 5
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </div>
  );
}

export default function LootDrop({ rewards, onClose }) {
  return (
    <div className="fixed inset-0 bg-dark/95 z-50 flex flex-col items-center justify-center p-6">
      <Confetti />

      {/* Title */}
      <div className="text-center mb-8 animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold text-primary mb-2">LOOT DROP!</h1>
        <p className="text-gray-400">You unlocked new rewards!</p>
      </div>

      {/* Rewards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {rewards.map((reward, index) => (
          <div
            key={reward.reward_id || index}
            className="bg-dark-light rounded-2xl p-4 flex items-center gap-4 border border-primary/30"
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.2}s both`
            }}
          >
            <div className="text-4xl">{reward.reward_icon || '🎁'}</div>
            <div>
              <h3 className="text-white font-semibold">{reward.reward_name}</h3>
              <p className="text-secondary text-sm">
                ${reward.reward_value?.toFixed(2)} value
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={onClose}
        className="w-full max-w-sm bg-primary text-dark font-bold py-4 rounded-xl text-lg
                   hover:bg-yellow-400 active:scale-95 transition-all pulse-glow"
      >
        Claim Your Rewards
      </button>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
