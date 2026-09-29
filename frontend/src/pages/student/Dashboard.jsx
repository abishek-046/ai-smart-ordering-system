import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const QUICK = [
  { to: '/menu',            icon: '🍽️', label: 'Browse Menu',    sub: '33 dishes',     color: '#fef3c7', border: 'rgba(217,119,6,0.2)' },
  { to: '/recommendations', icon: '🤖', label: 'AI Picks',       sub: 'Just for you',  color: '#ede9fe', border: 'rgba(139,92,246,0.2)' },
  { to: '/cart',            icon: '🛒', label: 'My Cart',        sub: 'Review items',  color: '#dbeafe', border: 'rgba(59,130,246,0.2)'  },
  { to: '/orders',          icon: '📋', label: 'Order History',  sub: 'All orders',    color: '#dcfce7', border: 'rgba(34,197,94,0.2)'   },
];

const STATUS_STEP = { PENDING: 1, ACCEPTED: 2, PREPARING: 3, READY: 4, COLLECTED: 5 };
const STATUS_MSG  = {
  PENDING:   { icon: '⏳', text: 'Waiting for acceptance',      color: '#d97706' },
  ACCEPTED:  { icon: '✅', text: 'Accepted — queued for prep',  color: '#3b82f6' },
  PREPARING: { icon: '👨‍🍳', text: 'Being prepared in kitchen', color: '#f97316' },
  READY:     { icon: '🔔', text: 'Ready for pickup at counter', color: '#22c55e' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeOrder, setActive]  = useState(null);

  useEffect(() => {
    orderApi.getAll({ limit: 5 })
      .then(r => {
        setOrders(r.data.orders);
        const a = r.data.orders.find(o => ['PENDING','ACCEPTED','PREPARING','READY'].includes(o.status));
        setActive(a || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Hero greeting ─────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background: 'linear-gradient(135deg,#0f0a06 0%,#1e1208 50%,#2d1f0e 100%)', minHeight: 180 }}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }} />
        <div className="relative z-10 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-amber-400/80 text-sm font-semibold font-body mb-1">{greeting}</p>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{user?.name} 👋</h1>
            {user?.studentId && (
              <p className="text-charcoal-400 text-sm font-body">Student ID: {user.studentId}</p>
            )}
            <div className="flex gap-3 mt-5">
              <Link to="/menu" className="btn-gold text-sm py-2.5 px-5">🍽️ Order Now</Link>
              <Link to="/recommendations"
                    className="text-sm py-2.5 px-5 rounded-2xl font-semibold transition-colors font-body"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
                🤖 AI Picks
              </Link>
            </div>
          </div>
          {/* Floating dish */}
          <div className="hidden sm:flex flex-col items-center gap-2 opacity-60 animate-float">
            <span className="text-6xl">🍛</span>
            <p className="text-amber-400/70 text-xs font-body">Ready to order?</p>
          </div>
        </div>
      </div>

      {/* ── Active order tracker ───────────────────────────────── */}
      {activeOrder && (() => {
        const s = STATUS_MSG[activeOrder.status];
        const step = STATUS_STEP[activeOrder.status] || 1;
        return (
          <div className="card border-l-4 relative overflow-hidden"
               style={{ borderLeftColor: s.color }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-2xl"
                 style={{ background: s.color }} />
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-display font-bold text-charcoal-900">Active Order</span>
                  <StatusBadge status={activeOrder.status} />
                </div>
                <p className="text-charcoal-500 text-sm font-body">{s.text}</p>
                <p className="text-xs text-charcoal-400 font-body mt-1">
                  Token: <span className="font-mono font-bold text-primary-700">{activeOrder.token}</span>
                  {' · '}Pickup: <span className="font-semibold">{formatTime(activeOrder.pickupTime)}</span>
                </p>
              </div>
              <Link to={`/track/${activeOrder.token}`} className="btn-primary text-sm py-2 px-4 flex-shrink-0">
                Track →
              </Link>
            </div>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between">
                {['Placed','Accepted','Preparing','Ready','Done'].map((st, i) => (
                  <div key={st} className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'text-white' : 'bg-charcoal-100 text-charcoal-400'}`}
                         style={i < step ? { background: s.color } : {}}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="text-xs text-charcoal-400 hidden sm:block">{st}</span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${((step - 1) / 4) * 100}%`, background: s.color }} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Quick actions ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {QUICK.map(q => (
          <Link key={q.to} to={q.to}
                className="rounded-2xl p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                style={{ background: q.color, border: `1px solid ${q.border}` }}>
            <span className="text-3xl">{q.icon}</span>
            <div>
              <p className="font-bold text-charcoal-900 text-sm">{q.label}</p>
              <p className="text-charcoal-500 text-xs font-body">{q.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent orders ──────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-charcoal-900">Recent Orders</h2>
            <p className="text-charcoal-400 text-xs font-body mt-0.5">Your last 5 orders</p>
          </div>
          <Link to="/orders" className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="font-display font-bold text-charcoal-700 mb-1">No orders yet</p>
            <p className="text-charcoal-400 text-sm font-body mb-5">Place your first order from our menu</p>
            <Link to="/menu" className="btn-primary text-sm py-2.5 px-6">Browse Menu →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Link key={order.id} to={`/track/${order.token}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-charcoal-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                {/* Status dot */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.1),rgba(245,158,11,0.06))' }}>
                  {order.status === 'READY' ? '🔔' : order.status === 'COLLECTED' ? '✅' : order.status === 'CANCELLED' ? '❌' : '🍳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-charcoal-900 text-sm">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-charcoal-400 text-xs font-body mt-0.5 truncate">
                    {order.items.slice(0, 2).map(i => i.foodItem.name).join(', ')}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary-700">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-charcoal-400 text-xs font-body">{formatDateTime(order.createdAt).split(',')[1]?.trim()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom tip ────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
           style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.08),rgba(245,158,11,0.04))', border: '1px solid rgba(217,119,6,0.15)' }}>
        <span className="text-2xl flex-shrink-0">💡</span>
        <p className="text-sm font-body text-charcoal-600">
          <span className="font-bold text-primary-700">Pro tip:</span> Use <strong>AI Picks</strong> to get personalised food recommendations based on your order history, or <strong>Smart Pickup Time</strong> to find the least crowded slot.
        </p>
      </div>
    </div>
  );
}
