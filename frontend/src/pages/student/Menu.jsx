import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import SkeletonCard from '../../components/ui/SkeletonCard';

const CATEGORIES = ['ALL', 'BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const [adding, setAdding] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = { available: 'true' };
    if (category !== 'ALL') params.category = category;
    if (search) params.search = search;
    menuApi.getAll(params)
      .then((res) => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search]);

  const handleAdd = async (item) => {
    setAdding((p) => ({ ...p, [item.id]: true }));
    try { await addToCart(item.id, 1); } finally { setAdding((p) => ({ ...p, [item.id]: false })); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🍽️ Menu</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} items available</p>
        </div>
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
          >
            {cat === 'ALL' ? '🍽️ All' : `${getCategoryEmoji(cat)} ${cat}`}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonCard count={6} />
      ) : items.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">No items found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow flex flex-col">
              {/* Image placeholder with gradient */}
              <div className={`h-40 rounded-xl mb-4 flex items-center justify-center text-6xl bg-gradient-to-br ${getCategoryBg(item.category)}`}>
                {getCategoryEmoji(item.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link to={`/menu/${item.id}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors leading-tight">
                    {item.name}
                  </Link>
                  <span className="text-primary-600 font-bold text-sm whitespace-nowrap">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span>⏱️ {item.prepTimeMinutes} min</span>
                  <span>⭐ {item.rating.toFixed(1)}</span>
                  <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleAdd(item)}
                disabled={adding[item.id] || !item.isAvailable}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {adding[item.id] ? <Spinner size="sm" color="white" /> : '+ Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryBg(cat) {
  const map = {
    BREAKFAST: 'from-yellow-100 to-orange-50',
    LUNCH: 'from-green-100 to-emerald-50',
    SNACKS: 'from-orange-100 to-amber-50',
    BEVERAGES: 'from-blue-100 to-cyan-50',
    DESSERTS: 'from-pink-100 to-rose-50',
    SPECIAL: 'from-purple-100 to-violet-50',
  };
  return map[cat] || 'from-gray-100 to-gray-50';
}
