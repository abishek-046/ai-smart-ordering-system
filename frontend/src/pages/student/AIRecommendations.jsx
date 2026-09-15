import { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji, getCategoryLabel } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function AIRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topPicks');
  const { addToCart } = useCart();
  const [adding, setAdding] = useState({});

  useEffect(() => {
    aiApi.getRecommendations()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (itemId) => {
    setAdding((p) => ({ ...p, [itemId]: true }));
    try { await addToCart(itemId, 1); } finally { setAdding((p) => ({ ...p, [itemId]: false })); }
  };

  const tabs = [
    { key: 'topPicks', label: '🤖 AI Top Picks' },
    { key: 'popular', label: '🔥 Popular' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI Recommendations</h1>
        <p className="text-gray-500 text-sm mt-1">Personalised picks based on your order history and preferences</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* User profile card */}
          {data?.userProfile && (
            <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
                <div>
                  <p className="font-bold text-gray-900">Your Taste Profile</p>
                  {data.userProfile.hasHistory ? (
                    <p className="text-sm text-gray-600">
                      Favourite: <span className="font-semibold text-purple-700">{data.userProfile.favoriteCategories.map((c) => getCategoryLabel(c)).join(', ') || 'N/A'}</span>
                      {' · '}Avg spend: <span className="font-semibold">{formatCurrency(data.userProfile.avgSpend)}</span>
                      {' · '}{data.userProfile.totalOrders} orders
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Place your first order to personalise recommendations!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(activeTab === 'topPicks' ? data?.topPicks : data?.popularItems)?.map((item) => (
              <div key={item.id} className="card hover:shadow-md transition-shadow flex flex-col">
                <div className="h-32 rounded-xl mb-4 flex items-center justify-center text-5xl bg-gradient-to-br from-orange-50 to-amber-50">
                  {getCategoryEmoji(item.category)}
                </div>
                {activeTab === 'topPicks' && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, item.aiScore || 0)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{item.aiScore}%</span>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-primary-600">{formatCurrency(item.price)}</span>
                  <button onClick={() => handleAdd(item.id)} disabled={adding[item.id] || !item.isAvailable} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                    {adding[item.id] ? <Spinner size="sm" color="white" /> : '+ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Category recommendations */}
          {data?.categoryRecommendations && activeTab === 'topPicks' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">By Category</h2>
              {Object.entries(data.categoryRecommendations).slice(0, 3).map(([cat, items]) => (
                <div key={cat} className="card">
                  <h3 className="font-bold text-gray-800 mb-3">{getCategoryLabel(cat)}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {items.map((item) => (
                      <div key={item.id} className="text-center">
                        <div className="h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl mb-2">{getCategoryEmoji(item.category)}</div>
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-primary-600 font-bold">{formatCurrency(item.price)}</p>
                        <button onClick={() => handleAdd(item.id)} disabled={adding[item.id]} className="mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                          {adding[item.id] ? '...' : '+ Add'}
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
