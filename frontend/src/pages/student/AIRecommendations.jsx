import { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji, getCategoryLabel } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function AIRecommendations() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('topPicks');
  const { addToCart }         = useCart();
  const [adding, setAdding]   = useState({});

  useEffect(() => {
    aiApi.getRecommendations()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (id) => {
    setAdding(p => ({ ...p, [id]: true }));
    try { await addToCart(id, 1); }
    finally { setAdding(p => ({ ...p, [id]: false })); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">AI Recommendations</h1>
        <p className="text-charcoal-500 font-body text-sm mt-1">Personalised picks based on your order history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Profile card */}
          {data?.userProfile && (
            <div className="rounded-3xl p-5"
                 style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(217,119,6,0.05))', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                     style={{ background: 'rgba(139,92,246,0.15)' }}>🧠</div>
                <div>
                  <p className="font-display font-bold text-charcoal-900">Your Taste Profile</p>
                  {data.userProfile.hasHistory ? (
                    <p className="text-sm text-charcoal-600 font-body">
                      Favourites: <span className="font-semibold text-purple-700">
                        {data.userProfile.favoriteCategories.map(c => getCategoryLabel(c).split(' ').slice(1).join(' ')).join(', ') || 'N/A'}
                      </span>
                      {' · '}Avg spend: <span className="font-semibold">{formatCurrency(data.userProfile.avgSpend)}</span>
                      {' · '}{data.userProfile.totalOrders} orders
                    </p>
                  ) : (
                    <p className="text-sm text-charcoal-400 font-body">Place your first order to personalise recommendations!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {[['topPicks','🤖 AI Top Picks'],['popular','🔥 Popular']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                      className={k === tab ? 'cat-tab-active' : 'cat-tab-inactive'}>
                {l}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(tab === 'topPicks' ? data?.topPicks : data?.popularItems)?.map(item => (
              <div key={item.id} className="food-card">
                <div className="h-36 flex items-center justify-center text-6xl"
                     style={{ background: 'linear-gradient(135deg,#fef9f0,#fef3c7)' }}>
                  {getCategoryEmoji(item.category)}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {tab === 'topPicks' && item.aiScore && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100,item.aiScore)}%`, background: 'linear-gradient(90deg,#d97706,#f59e0b)' }} />
                      </div>
                      <span className="text-xs text-charcoal-400 font-body w-8 text-right">{item.aiScore}%</span>
                    </div>
                  )}
                  <h3 className="font-display font-bold text-charcoal-900 mb-1 text-sm">{item.name}</h3>
                  <p className="text-xs text-charcoal-500 font-body line-clamp-2 flex-1 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-display font-bold" style={{ color: '#d97706' }}>{formatCurrency(item.price)}</span>
                    <button onClick={() => handleAdd(item.id)} disabled={adding[item.id] || !item.isAvailable}
                            className="text-sm px-4 py-1.5 rounded-xl font-bold text-white transition-all active:scale-95"
                            style={{ background: item.isAvailable ? 'linear-gradient(135deg,#d97706,#f59e0b)' : '#d4c9b8' }}>
                      {adding[item.id] ? <Spinner size="sm" color="white" /> : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
