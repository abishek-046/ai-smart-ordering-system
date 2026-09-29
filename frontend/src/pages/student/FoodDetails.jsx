import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji, getCategoryLabel } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const CATEGORY_BG = {
  BREAKFAST: 'from-amber-50  to-yellow-100',
  LUNCH:     'from-orange-50 to-amber-100',
  SNACKS:    'from-red-50    to-orange-100',
  BEVERAGES: 'from-sky-50    to-blue-100',
  DESSERTS:  'from-pink-50   to-rose-100',
  SPECIAL:   'from-violet-50 to-purple-100',
};

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    menuApi.getById(id)
      .then(r => setItem(r.data.item))
      .catch(() => navigate('/menu'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(item.id, qty); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="lg" />
    </div>
  );
  if (!item) return null;

  const bg = CATEGORY_BG[item.category] || 'from-gray-50 to-gray-100';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors mb-5 font-semibold">
        ← Back to Menu
      </button>

      <div className="card overflow-hidden p-0">
        {/* Hero image */}
        <div className={`h-64 bg-gradient-to-br ${bg} flex items-center justify-center relative`}>
          <span className="text-9xl drop-shadow-xl select-none animate-float">
            {getCategoryEmoji(item.category)}
          </span>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-charcoal-900/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg px-5 py-2.5 rounded-2xl bg-red-600">Unavailable</span>
            </div>
          )}
        </div>

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-display text-3xl font-bold text-charcoal-900 leading-tight">{item.name}</h1>
            <span className="font-display text-2xl font-bold flex-shrink-0" style={{ color: '#d97706' }}>
              {formatCurrency(item.price)}
            </span>
          </div>

          {/* Category + tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="tag-pill">{getCategoryLabel(item.category)}</span>
            {item.tags?.map(tag => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>

          <p className="text-charcoal-600 font-body leading-relaxed mb-6">{item.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl mb-7"
               style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.1)' }}>
            <div className="text-center">
              <p className="text-xs text-charcoal-400 font-body mb-1">Prep Time</p>
              <p className="font-display font-bold text-xl text-charcoal-900">{item.prepTimeMinutes} min</p>
            </div>
            <div className="text-center border-x border-charcoal-100">
              <p className="text-xs text-charcoal-400 font-body mb-1">Rating</p>
              <p className="font-display font-bold text-xl text-amber-500">⭐ {item.rating.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-charcoal-400 font-body mb-1">Reviews</p>
              <p className="font-display font-bold text-xl text-charcoal-900">{item.totalRatings}</p>
            </div>
          </div>

          {/* Add to cart */}
          {item.isAvailable ? (
            <div className="flex items-center gap-4">
              {/* Qty */}
              <div className="flex items-center rounded-2xl border border-charcoal-200 overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-11 h-11 flex items-center justify-center text-charcoal-700 font-bold text-lg hover:bg-charcoal-50 transition-colors">
                  −
                </button>
                <span className="w-10 text-center font-bold text-charcoal-900 text-base">{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))}
                        className="w-11 h-11 flex items-center justify-center text-charcoal-700 font-bold text-lg hover:bg-charcoal-50 transition-colors">
                  +
                </button>
              </div>

              <button onClick={handleAdd} disabled={adding}
                      className="flex-1 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-gold active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                {adding
                  ? <><Spinner size="sm" color="white" /> Adding…</>
                  : `Add ${qty} to Cart · ${formatCurrency(item.price * qty)}`}
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-center font-semibold">
              ❌ This item is currently unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
