import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji, getCategoryLabel } from '../../utils/helpers';
import SkeletonCard from '../../components/ui/SkeletonCard';
import Spinner from '../../components/ui/Spinner';

const CATEGORIES = ['ALL', 'BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];

const CATEGORY_BG = {
  BREAKFAST: 'from-amber-50  to-yellow-50',
  LUNCH:     'from-orange-50 to-amber-50',
  SNACKS:    'from-red-50    to-orange-50',
  BEVERAGES: 'from-sky-50    to-blue-50',
  DESSERTS:  'from-pink-50   to-rose-50',
  SPECIAL:   'from-violet-50 to-purple-50',
};

const RATING_STARS = (r) => {
  const full = Math.floor(r);
  const half = r % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

export default function Menu() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch]   = useState('');
  const [adding, setAdding]   = useState({});
  const { addToCart }         = useCart();

  const fetchMenu = useCallback(() => {
    setLoading(true);
    const params = { available: 'true' };
    if (category !== 'ALL') params.category = category;
    if (search.trim()) params.search = search.trim();
    menuApi.getAll(params)
      .then(r => setItems(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(fetchMenu, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchMenu, search]);

  const handleAdd = async (item) => {
    setAdding(p => ({ ...p, [item.id]: true }));
    try { await addToCart(item.id, 1); }
    finally { setAdding(p => ({ ...p, [item.id]: false })); }
  };

  // Group by category for section headers
  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const list = items.filter(i => i.category === cat);
    if (list.length) acc[cat] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900">Our Menu</h1>
          <p className="text-charcoal-500 font-body text-sm mt-1">
            {loading ? 'Loading…' : `${items.length} dishes available today`}
          </p>
        </div>
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search dishes, ingredients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={category === cat ? 'cat-tab-active' : 'cat-tab-inactive'}
          >
            {cat === 'ALL'
              ? '🍽️ All'
              : `${getCategoryEmoji(cat)} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : items.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-bold text-charcoal-700 mb-2">No dishes found</h3>
          <p className="text-charcoal-400 font-body text-sm">Try a different category or search term</p>
        </div>
      ) : category !== 'ALL' ? (
        /* Single category flat grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <FoodCard key={item.id} item={item} adding={adding[item.id]} onAdd={handleAdd} />
          ))}
        </div>
      ) : (
        /* All — grouped by category with section headers */
        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <section key={cat}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                     style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.12),rgba(245,158,11,0.06))' }}>
                  {getCategoryEmoji(cat)}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-charcoal-900">
                    {getCategoryLabel(cat).replace(/^[^\s]+\s/, '')}
                  </h2>
                  <p className="text-xs text-charcoal-400 font-body">{catItems.length} items</p>
                </div>
                <div className="flex-1 h-px ml-2" style={{ background: 'linear-gradient(90deg,rgba(217,119,6,0.3),transparent)' }} />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catItems.map(item => (
                  <FoodCard key={item.id} item={item} adding={adding[item.id]} onAdd={handleAdd} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FoodCard({ item, adding, onAdd }) {
  const bg = CATEGORY_BG[item.category] || 'from-gray-50 to-gray-100';
  return (
    <div className="food-card group">
      {/* Image area */}
      <Link to={`/menu/${item.id}`} className="block relative">
        <div className={`h-44 bg-gradient-to-br ${bg} flex items-center justify-center relative overflow-hidden`}>
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md select-none">
            {getCategoryEmoji(item.category)}
          </span>
          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {item.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                {tag}
              </span>
            ))}
          </div>
          {/* Unavailable overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-charcoal-900/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-sm px-3 py-1.5 rounded-full bg-red-600">Unavailable</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link to={`/menu/${item.id}`}
                className="font-display font-bold text-charcoal-900 hover:text-primary-700 transition-colors leading-tight text-base line-clamp-1">
            {item.name}
          </Link>
          <span className="font-bold text-primary-700 text-base whitespace-nowrap flex-shrink-0">
            {formatCurrency(item.price)}
          </span>
        </div>

        <p className="text-charcoal-500 text-xs font-body line-clamp-2 mb-3 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-charcoal-400 mb-3">
          <span className="flex items-center gap-1">
            <span className="text-amber-400">★</span>
            <span className="font-semibold text-charcoal-600">{item.rating.toFixed(1)}</span>
            <span>({item.totalRatings})</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-charcoal-200" />
          <span>⏱ {item.prepTimeMinutes} min</span>
          {item.isAvailable && (
            <>
              <span className="w-1 h-1 rounded-full bg-charcoal-200" />
              <span className="text-green-600 font-semibold">Available</span>
            </>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={() => onAdd(item)}
          disabled={adding || !item.isAvailable}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            item.isAvailable
              ? 'text-white hover:shadow-gold active:scale-95'
              : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
          }`}
          style={item.isAvailable ? { background: 'linear-gradient(135deg,#d97706,#f59e0b)' } : {}}>
          {adding
            ? <Spinner size="sm" color="white" />
            : item.isAvailable
              ? '+ Add to Cart'
              : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
