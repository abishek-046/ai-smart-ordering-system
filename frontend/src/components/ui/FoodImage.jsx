import { useState } from 'react';

// Category fallback gradients + emojis when photo fails or is missing
const FALLBACK = {
  BREAKFAST: { gradient: 'linear-gradient(135deg,#fef9c3,#fde68a)', emoji: '🌅' },
  LUNCH:     { gradient: 'linear-gradient(135deg,#fed7aa,#fbbf24)', emoji: '🍛' },
  SNACKS:    { gradient: 'linear-gradient(135deg,#fee2e2,#fca5a5)', emoji: '🍟' },
  BEVERAGES: { gradient: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', emoji: '☕' },
  DESSERTS:  { gradient: 'linear-gradient(135deg,#fce7f3,#f9a8d4)', emoji: '🍮' },
  SPECIAL:   { gradient: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', emoji: '⭐' },
};

/**
 * FoodImage — renders a real dish photograph with smooth fallback.
 *
 * Props:
 *   src       — full Unsplash (or any) image URL from DB
 *   alt       — dish name for accessibility
 *   category  — used to pick fallback gradient + emoji
 *   className — extra classes on the outer wrapper div
 */
export default function FoodImage({ src, alt = 'Food', category = 'SPECIAL', className = '' }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const fb = FALLBACK[category] || FALLBACK.SPECIAL;
  const showImage = src && status !== 'error';

  return (
    <div
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={!showImage ? { background: fb.gradient } : { background: '#f0ede6' }}
    >
      {/* Loading shimmer — shown until the image loads */}
      {showImage && status === 'loading' && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Real photo */}
      {showImage && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            opacity: status === 'loaded' ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Fallback — shown when no src or image failed */}
      {!showImage && (
        <div className="absolute inset-0 flex items-center justify-center select-none">
          <span className="text-5xl">{fb.emoji}</span>
        </div>
      )}
    </div>
  );
}
