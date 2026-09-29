import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { formatCurrency, formatTime, getStatusLabel } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUS_STEP = { PENDING: 1, ACCEPTED: 2, PREPARING: 3, READY: 4, COLLECTED: 5 };
const STATUS_COLOR = {
  PENDING:   '#f59e0b',
  ACCEPTED:  '#3b82f6',
  PREPARING: '#f97316',
  READY:     '#22c55e',
  COLLECTED: '#9d8d74',
  CANCELLED: '#ef4444',
};
const STATUS_MSG = {
  PENDING:   'Waiting for canteen to accept',
  ACCEPTED:  'Accepted — queued for kitchen',
  PREPARING: 'Being prepared right now',
  READY:     'Ready! Collect at the counter',
};

const QUICK_ACTIONS = [
  { to: '/menu',            icon: '🍽️', label: 'Browse Menu',   sub: '32 real dishes',   bg: '#fef3c7', border: 'rgba(217,119,6,0.2)'  },
  { to: '/recommendations', icon: '🤖', label: 'AI Picks',       sub: 'Personalised',     bg: '#ede9fe', border: 'rgba(139,92,246,0.2)' },
  { to: '/cart',            icon: '🛒', label: 'My Cart',        sub: 'View items',        bg: '#dbeafe', border: 'rgba(59,130,246,0.2)' },
  { to: '/orders',          icon: '📋', label: 'Order History',  sub: 'Past orders',       bg: '#dcfce7', border: 'rgba(34,197,94,0.2)'  },
];

export default function Dashboard() {
  const { user }                    = useAuth();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeOrder, setActive]    = useState(null);

  useEffect(() => {
    orderApi.getAll({ limit: 5 })
      .then(r => {
        setOrders(r.data.orders);
        const a = r.data.orders.find(o =>
          ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        );
        setActive(a || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Hero greeting ─────────────────────────────────────── */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg,#0f0a06 0%,#1e1208 50%,#2d1f0e 100%)',
          minHeight: 176,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }}
        />
        <div className="relative z-10 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-body text-sm mb-1" style={{ color: 'rgba(245,158,11,0.75)' }}>
              {greeting} 👋
            </p>
            <h1 className="font-display text-3xl font-bold text-white mb-0.5">
              {user?.name}
            </h1>
            {user?.studentId && (
              <p className="text-charcoal-400 text-sm font-body">ID: {user.studentId}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/menu" className="btn-gold text-sm py-2.5 px-5">
                Order Food →
              </Link>
              <Link
                to="/pickup-time"
                className="text-sm py-2.5 px-5 rounded-2xl font-semibold font-body transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                ⏰ Smart Pickup
              </Link>
            </div>
          </div>
          <div className="hidden sm:block text-6xl opacity-40 animate-float select-none">🍛</div>
        </div>
      </div>

      {/* ── Active order tracker ───────────────────────────────── */}
      {activeOrder && (() => {
        const color = STATUS_COLOR[activeOrder.status] || '#d97706';
        const step  = STATUS_STEP[activeOrder.status] || 1;
        return (
          <div
            className="card relative overflow-hidden"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl pointer-events-none"
              style={{ background: color }}
            />
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color }}>
                  Active Order
                </p>
                <p className="font-display font-bold text-charcoal-900 text-lg leading-tight">
                  {STATUS_MSG[activeOrder.status] || getStatusLabel(activeOrder.status)}
                </p>
                <p className="text-xs text-charcoal-400 font-body mt-1">
                  <span className="font-mono font-bold text-primary-700">{activeOrder.token}</span>
                  {' · '}Pickup at <span className="font-semibold">{formatTime(activeOrder.pickupTime)}</span>
                </p>
              </div>
              <Link to={`/track/${activeOrder.token}`} className="btn-gold text-sm py-2 px-4 flex-shrink-0">
                Track →
              </Link>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="relative flex items-center justify-between">
                <div
                  className="absolute left-3.5 right-3.5 top-3.5 h-0.5 -z-0"
                  style={{ background: '#f0ede6' }}
                >
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${((step - 1) / 4) * 100}%`, background: color }}
                  />
                </div>
                {['Placed', 'Accepted', 'Preparing', 'Ready', 'Done'].map((label, i) => {
                  const done   = i < step;
                  const active = i === step - 1;
                  return (
                    <div key={label} className="flex flex-col items-center gap-1.5 z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          active ? 'ring-4' : ''
                        }`}
                        style={{
                          background: done || active ? color : '#f0ede6',
                          color:      done || active ? 'white'  : '#9d8d74',
                          ringColor:  active ? `${color}30` : 'transparent',
                        }}
                      >
                        {done && !active ? '✓' : i + 1}
                      </div>
                      <span className="text-xs text-charcoal-400 font-body hidden sm:block">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Quick actions ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(q => (
          <Link
            key={q.to}
            to={q.to}
            className="rounded-2xl p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            style={{ background: q.bg, border: `1px solid ${q.border}` }}
          >
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
          <Link to="/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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
            <Link to="/menu" className="btn-gold text-sm py-2.5 px-6">Browse Menu →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/track/${order.token}`}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-charcoal-50 transition-colors border border-transparent hover:border-charcoal-100"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(217,119,6,0.08)' }}
                >
                  {order.status === 'READY' ? '🔔'
                    : order.status === 'COLLECTED' ? '✅'
                    : order.status === 'CANCELLED' ? '❌'
                    : '🍳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-charcoal-900 text-sm">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-charcoal-400 text-xs font-body truncate">
                    {order.items?.slice(0, 2).map(i => i.foodItem?.name).filter(Boolean).join(', ')}
                    {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: '#d97706' }}>
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-charcoal-400 text-xs font-body">
                    {formatTime(order.pickupTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Pro tip ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.12)' }}
      >
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-sm font-body text-charcoal-600">
          <span className="font-bold text-primary-700">Pro tip:</span>{' '}
          Use <strong>AI Picks</strong> for personalised recommendations, or{' '}
          <strong>Smart Pickup</strong> to get the least-busy time slot.
        </p>
      </div>
    </div>
  );
}
