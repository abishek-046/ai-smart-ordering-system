import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryLabel } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]     = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart }     = useCart();

  useEffect(() => {
    menuApi.getById(id)
      .then(r => setItem(r.data.item))
      .catch(() => navigate('/menu', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (adding || !item.isAvailable) return;
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

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors mb-5 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Menu
      </button>

      <div className="card overflow-hidden p-0">
        {/* ── Hero photo ──────────────────────────────────────── */}
        <div className="relative h-72 overflow-hidden">
          <FoodImage
            src={item.image}
            alt={item.name}
            category={item.category}
            className="h-full"
          />
          {/* Gradient overlay for text legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(15,10,6,0.6),transparent)' }}
          />
          {/* Category badge */}
          <div className="absolute bottom-4 left-4">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm text-white"
              style={{ background: 'rgba(15,10,6,0.55)' }}
            >
              {getCategoryLabel(item.category)}
            </span>
          </div>
          {/* Unavailable */}
          {!item.isAvailable && (
            <div className="unavailable-overlay">
              <span className="text-white font-bold text-base px-5 py-2.5 rounded-full bg-red-600/90 backdrop-blur-sm">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Name & Price */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-display text-2xl font-bold text-charcoal-900 leading-tight">
              {item.name}
            </h1>
            <span className="font-display text-2xl font-bold flex-shrink-0" style={{ color: '#d97706' }}>
              {formatCurrency(item.price)}
            </span>
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map(tag => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          )}

          <p className="text-charcoal-600 font-body leading-relaxed mb-5 text-sm">
            {item.description}
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.1)' }}
          >
            {[
              { label: 'Prep Time', value: `${item.prepTimeMinutes} min`, icon: '⏱️' },
              { label: 'Rating',    value: item.totalRatings > 0 ? `⭐ ${item.rating.toFixed(1)}` : 'New', icon: null },
              { label: 'Reviews',   value: item.totalRatings, icon: null },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xs text-charcoal-400 font-body mb-1">{s.label}</p>
                <p className="font-display font-bold text-charcoal-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Add to cart */}
          {item.isAvailable ? (
            <div className="flex items-center gap-4">
              {/* Qty stepper */}
              <div className="flex items-center rounded-2xl border border-charcoal-200 overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-charcoal-700 font-bold text-lg hover:bg-charcoal-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-charcoal-900">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(10, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-charcoal-700 font-bold text-lg hover:bg-charcoal-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-gold active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}
              >
                {adding ? (
                  <><Spinner size="sm" color="white" /> Adding…</>
                ) : (
                  `Add ${qty} to Cart · ${formatCurrency(item.price * qty)}`
                )}
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-center font-semibold text-sm">
              This item is currently unavailable. Check back soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
