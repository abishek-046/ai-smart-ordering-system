import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryLabel } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';

const TABS = [
  { key: 'topPicks', label: '🤖 AI Top Picks' },
  { key: 'popular',  label: '🔥 Popular Now'  },
];

function RecommendationCard({ item, onAdd }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (adding || !item.isAvailable) return;
    setAdding(true);
    try { await onAdd(item.id, 1); }
    finally { setAdding(false); }
  };

  return (
    <div className="food-card group flex flex-col">
      {/* Photo */}
      <Link to={`/menu/${item.id}`} className="block relative h-40 rounded-t-3xl overflow-hidden flex-shrink-0">
        <FoodImage
          src={item.image}
          alt={item.name}
          category={item.category}
          className="h-full"
        />
        {!item.isAvailable && (
          <div className="unavailable-overlay rounded-t-3xl">
            <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-red-600/90">
              Unavailable
            </span>
          </div>
        )}
        {item.aiScore != null && (
          <div
            className="absolute bottom-2 left-2 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(15,10,6,0.65)', color: '#fbbf24' }}
          >
            {Math.min(100, item.aiScore)}% match
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* AI score bar */}
        {item.aiScore != null && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, item.aiScore)}%`,
                  background: 'linear-gradient(90deg,#d97706,#f59e0b)',
                }}
              />
            </div>
            <span className="text-xs text-charcoal-400 font-body w-10 text-right flex-shrink-0">
              {Math.min(100, item.aiScore)}%
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/menu/${item.id}`}
            className="font-display font-bold text-charcoal-900 text-sm leading-snug line-clamp-1 hover:text-primary-700 transition-colors"
          >
            {item.name}
          </Link>
          <span className="font-bold text-primary-700 text-sm whitespace-nowrap flex-shrink-0">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="text-charcoal-500 text-xs font-body line-clamp-2 leading-relaxed mb-3 flex-1">
          {item.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-charcoal-400 font-body mb-3">
          {item.totalRatings > 0 && (
            <>
              <span className="text-amber-500">★ {item.rating.toFixed(1)}</span>
              <span className="text-charcoal-200">·</span>
            </>
          )}
          <span>⏱ {item.prepTimeMinutes} min</span>
          <span className="text-charcoal-200">·</span>
          <span className="text-charcoal-400">{getCategoryLabel(item.category).replace(/^[^\s]+\s/, '')}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || !item.isAvailable}
          className={`w-full py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            !item.isAvailable
              ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
              : 'text-white hover:shadow-gold active:scale-95'
          }`}
          style={item.isAvailable ? { background: 'linear-gradient(135deg,#d97706,#f59e0b)' } : {}}
        >
          {adding ? <Spinner size="sm" color="white" /> : item.isAvailable ? '+ Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

export default function AIRecommendations() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('topPicks');
  const { addToCart }       = useCart();

  useEffect(() => {
    aiApi.getRecommendations()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayItems = tab === 'topPicks' ? data?.topPicks : data?.popularItems;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">AI Recommendations</h1>
        <p className="text-charcoal-500 font-body text-sm mt-1">
          Personalised picks based on your order history and preferences
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Taste profile card */}
          {data?.userProfile && (
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'linear-gradient(135deg,rgba(139,92,246,0.07),rgba(217,119,6,0.04))',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.12)' }}
                >
                  🧠
                </div>
                <div>
                  <p className="font-display font-bold text-charcoal-900">Your Taste Profile</p>
                  {data.userProfile.hasHistory ? (
                    <p className="text-sm text-charcoal-600 font-body mt-0.5">
                      Favourite categories:{' '}
                      <span className="font-semibold text-purple-700">
                        {data.userProfile.favoriteCategories
                          .map(c => getCategoryLabel(c).replace(/^[^\s]+\s/, ''))
                          .join(', ') || 'N/A'}
                      </span>
                      {' · '}Average spend:{' '}
                      <span className="font-semibold">{formatCurrency(data.userProfile.avgSpend)}</span>
                      {' · '}{data.userProfile.totalOrders} orders
                    </p>
                  ) : (
                    <p className="text-sm text-charcoal-400 font-body mt-0.5">
                      Place your first order to personalise recommendations!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={t.key === tab ? 'cat-tab-active' : 'cat-tab-inactive'}
                aria-pressed={t.key === tab}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {displayItems?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayItems.map(item => (
                <RecommendationCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-14">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="font-display font-bold text-charcoal-700">No recommendations yet</p>
              <p className="text-charcoal-400 text-sm font-body mt-1">Browse the menu and place an order first</p>
              <Link to="/menu" className="btn-gold mt-5 inline-block px-6 py-2.5 text-sm">Browse Menu →</Link>
            </div>
          )}

          {/* Category recommendations */}
          {tab === 'topPicks' && data?.categoryRecommendations && (
            <div className="space-y-5">
              <div className="section-sep" />
              <h2 className="font-display text-xl font-bold text-charcoal-900">By Category</h2>
              {Object.entries(data.categoryRecommendations)
                .filter(([, items]) => items.length > 0)
                .slice(0, 3)
                .map(([cat, catItems]) => (
                  <div key={cat} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-charcoal-900">
                        {getCategoryLabel(cat)}
                      </h3>
                      <Link
                        to={`/menu?category=${cat}`}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        See all →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {catItems.slice(0, 3).map(item => (
                        <div key={item.id} className="text-center">
                          <Link to={`/menu/${item.id}`} className="block">
                            <div className="h-20 rounded-2xl overflow-hidden mb-2">
                              <FoodImage
                                src={item.image}
                                alt={item.name}
                                category={item.category}
                                className="h-full"
                              />
                            </div>
                            <p className="text-xs font-bold text-charcoal-900 line-clamp-1">{item.name}</p>
                          </Link>
                          <p className="text-xs font-semibold mt-0.5" style={{ color: '#d97706' }}>
                            {formatCurrency(item.price)}
                          </p>
                          <button
                            onClick={() => addToCart(item.id, 1)}
                            disabled={!item.isAvailable}
                            className="mt-1.5 text-xs font-bold px-3 py-1 rounded-lg text-white disabled:opacity-40"
                            style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
