import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryLabel } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';

const CATEGORIES = [
  { key: 'ALL',       label: 'All Items',        emoji: '🍽️' },
  { key: 'BREAKFAST', label: 'Breakfast',         emoji: '🌅' },
  { key: 'LUNCH',     label: 'Lunch',             emoji: '🍱' },
  { key: 'SNACKS',    label: 'Snacks',            emoji: '🍟' },
  { key: 'BEVERAGES', label: 'Beverages',         emoji: '☕' },
  { key: 'DESSERTS',  label: 'Desserts',          emoji: '🍮' },
  { key: 'SPECIAL',   label: "Today's Special",   emoji: '⭐' },
];

function FoodCard({ item, onAdd }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || !item.isAvailable) return;
    setAdding(true);
    try { await onAdd(item.id, 1); }
    finally { setAdding(false); }
  };

  return (
    <Link
      to={`/menu/${item.id}`}
      className="food-card group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-3xl"
      aria-label={`View details for ${item.name}`}
    >
      {/* ── Photo ──────────────────────────────────────────── */}
      <div className="relative h-48 rounded-t-3xl overflow-hidden flex-shrink-0">
        <FoodImage
          src={item.image}
          alt={item.name}
          category={item.category}
          className="h-full"
        />

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="unavailable-overlay rounded-t-3xl">
            <span className="text-white font-bold text-sm px-4 py-2 rounded-full bg-red-600/90 backdrop-blur-sm">
              Unavailable
            </span>
          </div>
        )}

        {/* Tag badges top-left */}
        {item.tags?.length > 0 && item.isAvailable && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {item.tags.slice(0, 1).map(tag => (
              <span
                key={tag}
                className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
                style={{ background: 'rgba(15,10,6,0.6)', color: 'rgba(255,255,255,0.92)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating badge top-right */}
        {item.totalRatings > 0 && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
            style={{ background: 'rgba(15,10,6,0.65)', color: '#fbbf24' }}
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {item.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-bold text-charcoal-900 text-base leading-snug line-clamp-1 group-hover:text-primary-700 transition-colors">
            {item.name}
          </h3>
          <span className="font-display font-bold text-primary-700 text-base whitespace-nowrap flex-shrink-0">
            {formatCurrency(item.price)}
          </span>
        </div>

        <p className="text-charcoal-500 text-xs font-body line-clamp-2 leading-relaxed mb-3 flex-1">
          {item.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-charcoal-400 font-body mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.prepTimeMinutes} min
          </span>
          {item.totalRatings > 0 && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-charcoal-200" />
              <span className="text-amber-500">★ {item.rating.toFixed(1)}</span>
              <span className="text-charcoal-300">({item.totalRatings})</span>
            </>
          )}
          {item.isAvailable && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-charcoal-200" />
              <span className="text-green-600 font-semibold">Available</span>
            </>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={adding || !item.isAvailable}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            !item.isAvailable
              ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
              : 'text-white hover:shadow-gold active:scale-95'
          }`}
          style={item.isAvailable ? { background: 'linear-gradient(135deg,#d97706,#f59e0b)' } : {}}
          aria-label={`Add ${item.name} to cart`}
        >
          {adding ? (
            <Spinner size="sm" color="white" />
          ) : item.isAvailable ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add to Cart
            </>
          ) : (
            'Unavailable'
          )}
        </button>
      </div>
    </Link>
  );
}

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState('');
  const searchRef               = useRef(null);
  const { addToCart }           = useCart();

  const fetchMenu = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { available: 'true' };
    if (category !== 'ALL') params.category = category;
    if (search.trim()) params.search = search.trim();
    menuApi.getAll(params)
      .then(r => setItems(r.data.items))
      .catch(() => setError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, [category, search]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchMenu, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMenu, search]);

  // Sync category to URL
  const changeCategory = (cat) => {
    setCategory(cat);
    if (cat === 'ALL') { setSearchParams({}); } else { setSearchParams({ category: cat }); }
  };

  // Group by category for "All" view
  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const list = items.filter(i => i.category === cat.key);
    if (list.length) acc[cat.key] = { label: cat.label, emoji: cat.emoji, items: list };
    return acc;
  }, {});

  const isEmpty = !loading && !error && items.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900">Our Menu</h1>
          <p className="text-charcoal-500 font-body text-sm mt-0.5">
            {loading
              ? 'Loading…'
              : error
                ? 'Error loading menu'
                : `${items.length} dish${items.length !== 1 ? 'es' : ''} available`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes, ingredients…"
            className="input-field pl-10 text-sm"
            aria-label="Search menu"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => changeCategory(cat.key)}
            className={category === cat.key ? 'cat-tab-active' : 'cat-tab-inactive'}
            aria-pressed={category === cat.key}
          >
            <span className="mr-1.5">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Error state ───────────────────────────────────────── */}
      {error && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-display font-bold text-charcoal-800 mb-2">{error}</p>
          <button onClick={fetchMenu} className="btn-primary text-sm px-6 mt-2">Try Again</button>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────── */}
      {loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden border border-charcoal-100">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between gap-3">
                  <div className="h-4 skeleton rounded-lg flex-1" />
                  <div className="h-4 skeleton rounded-lg w-16" />
                </div>
                <div className="h-3 skeleton rounded-lg w-full" />
                <div className="h-3 skeleton rounded-lg w-2/3" />
                <div className="h-10 skeleton rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {isEmpty && (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-bold text-charcoal-700 mb-2">No dishes found</h3>
          <p className="text-charcoal-400 font-body text-sm mb-5">
            {search ? `No results for "${search}"` : 'No items in this category right now'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary text-sm px-5">Clear search</button>
          )}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      {!loading && !error && items.length > 0 && (
        category !== 'ALL' ? (
          /* Single-category flat grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <FoodCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          /* All — grouped by category with section headers */
          <div className="space-y-10">
            {Object.entries(grouped).map(([catKey, { label, emoji, items: catItems }]) => (
              <section key={catKey} aria-label={label}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.12),rgba(245,158,11,0.06))' }}
                  >
                    {emoji}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal-900">{label}</h2>
                    <p className="text-xs text-charcoal-400 font-body">{catItems.length} item{catItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div
                    className="flex-1 h-px ml-2"
                    style={{ background: 'linear-gradient(90deg,rgba(217,119,6,0.25),transparent)' }}
                  />
                  <button
                    onClick={() => changeCategory(catKey)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex-shrink-0 transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catItems.map(item => (
                    <FoodCard key={item.id} item={item} onAdd={addToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      )}
    </div>
  );
}
