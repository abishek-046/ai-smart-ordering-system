import { useState } from 'react';

// Category fallback gradients when no image is provided or image fails to load
const FALLBACK_GRADIENT = {
  BREAKFAST: 'linear-gradient(135deg,#fef3c7,#fde68a)',
  LUNCH:     'linear-gradient(135deg,#fed7aa,#fbbf24)',
  SNACKS:    'linear-gradient(135deg,#fee2e2,#fca5a5)',
  BEVERAGES: 'linear-gradient(135deg,#bfdbfe,#93c5fd)',
  DESSERTS:  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  SPECIAL:   'linear-gradient(135deg,#ede9fe,#c4b5fd)',
};

const FALLBACK_EMOJI = {
  BREAKFAST: '🌅',
  LUNCH:     '🍛',
  SNACKS:    '🍟',
  BEVERAGES: '☕',
  DESSERTS:  '🍮',
  SPECIAL:   '⭐',
};

/**
 * FoodImage — renders a real dish photograph with graceful fallback.
 *
 * Props:
 *   src       — Unsplash URL (from DB image field)
 *   alt       — dish name for accessibility
 *   category  — used for fallback gradient/emoji
 *   className — extra Tailwind classes on the wrapper div
 *   imgClass  — extra classes on the <img> element
 */
export default function FoodImage({
  src,
  alt = 'Food',
  category = 'SPECIAL',
  className = '',
  imgClass = '',
}) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <div
      className={`food-img-wrap w-full h-full relative ${className}`}
      style={!showImage ? { background: FALLBACK_GRADIENT[category] || FALLBACK_GRADIENT.SPECIAL } : {}}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className={`food-img w-full h-full object-cover ${imgClass}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl select-none">
          {FALLBACK_EMOJI[category] || '🍽️'}
        </div>
      )}
    </div>
  );
}
