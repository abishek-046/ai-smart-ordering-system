import { useParams, Link } from 'react-router-dom';
import { useOrderPolling } from '../../hooks/useOrderPolling';
import { formatCurrency, formatTime, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'];

const STATUS_INFO = {
  PENDING:   { icon: '⏳', msg: 'Waiting for the canteen to accept your order.',      color: '#f59e0b' },
  ACCEPTED:  { icon: '✅', msg: 'Order accepted — queued for preparation.',            color: '#3b82f6' },
  PREPARING: { icon: '👨‍🍳', msg: 'Your food is being prepared in the kitchen.',        color: '#f97316' },
  READY:     { icon: '🔔', msg: 'Order ready! Please collect at the counter now.',    color: '#22c55e' },
  COLLECTED: { icon: '🎊', msg: 'Order collected. Enjoy your meal!',                  color: '#9d8d74' },
  CANCELLED: { icon: '❌', msg: 'This order has been cancelled.',                     color: '#ef4444' },
};

export default function OrderTracking() {
  const { token } = useParams();
  const { data, loading, error, refresh } = useOrderPolling(token, 15000);

  if (loading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );

  if (error || !data?.order) return (
    <div className="card text-center py-20 max-w-lg mx-auto">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-display text-xl font-bold text-charcoal-800 mb-2">
        {error || `Order not found`}
      </h2>
      <p className="text-charcoal-400 font-body text-sm mb-6">Token: <span className="font-mono">{token}</span></p>
      <Link to="/orders" className="btn-secondary text-sm px-6">← Order History</Link>
    </div>
  );

  const { order, tracking } = data;
  const statusIdx  = STATUS_STEPS.indexOf(order.status);
  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.PENDING;
  const isTerminal = ['COLLECTED', 'CANCELLED'].includes(order.status);
  const isReady    = order.status === 'READY';

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-charcoal-900">Order Tracking</h1>
        {!isTerminal && (
          <span className="flex items-center gap-1.5 text-xs text-charcoal-400 font-body">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live · updates every 15s
          </span>
        )}
      </div>

      {/* Token card */}
      <div
        className="rounded-3xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg,#0f0a06,#1e1208)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2 font-body"
          style={{ color: 'rgba(245,158,11,0.65)' }}
        >
          Your Digital Token
        </p>
        <p
          className="font-display font-extrabold text-4xl tracking-widest"
          style={{ color: '#f59e0b' }}
        >
          {order.token}
        </p>
        <p className="text-xs font-body mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Show this at the canteen counter when collecting
        </p>
      </div>

      {/* Status card — pulses green when READY */}
      <div
        className={`card transition-all duration-500 ${isReady ? 'border-2' : ''}`}
        style={isReady ? { borderColor: '#22c55e', background: 'rgba(34,197,94,0.04)' } : {}}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <span className="text-4xl">{statusInfo.icon}</span>
            {isReady && <span className="pulse-ring absolute inset-0 rounded-full" />}
          </div>
          <div>
            <StatusBadge status={order.status} />
            <p className="text-sm font-semibold mt-1.5 font-body" style={{ color: statusInfo.color }}>
              {tracking?.statusMessage || statusInfo.msg}
            </p>
          </div>
        </div>

        {/* Progress steps */}
        {order.status !== 'CANCELLED' && (
          <div className="relative flex items-start justify-between">
            {/* connector track */}
            <div
              className="absolute top-3.5 left-3.5 right-3.5 h-0.5"
              style={{ background: '#f0ede6', zIndex: 0 }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(0, statusIdx) * 25)}%`,
                  background: 'linear-gradient(90deg,#d97706,#f59e0b)',
                }}
              />
            </div>
            {STATUS_STEPS.map((s, i) => {
              const done   = i < statusIdx;
              const active = i === statusIdx;
              return (
                <div key={s} className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      active ? 'ring-4 ring-primary-100' : ''
                    }`}
                    style={{
                      background: done || active
                        ? 'linear-gradient(135deg,#d97706,#f59e0b)'
                        : '#f0ede6',
                      color: done || active ? 'white' : '#9d8d74',
                    }}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-charcoal-400 font-body hidden sm:block text-center w-14 leading-tight">
                    {s === 'COLLECTED' ? 'Done' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pickup countdown */}
        {tracking?.minutesUntilPickup > 0 && !isTerminal && (
          <div
            className="mt-5 text-center p-3 rounded-2xl"
            style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.12)' }}
          >
            <p className="text-xs text-charcoal-400 font-body mb-0.5">Pickup in approximately</p>
            <p className="font-display text-3xl font-bold" style={{ color: '#d97706' }}>
              {tracking.minutesUntilPickup} min
            </p>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="card">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pickup Time', value: formatTime(order.pickupTime) },
            { label: 'Est. Prep',   value: `${order.estimatedPrepTime} min` },
            { label: 'Ordered at',  value: formatDateTime(order.createdAt).split(',')[1]?.trim() || '—' },
            { label: 'Total',       value: formatCurrency(order.totalAmount) },
          ].map(info => (
            <div
              key={info.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#fdf8f0', border: '1px solid rgba(217,119,6,0.08)' }}
            >
              <p className="text-xs text-charcoal-400 font-body mb-1">{info.label}</p>
              <p className="font-bold text-charcoal-900 text-sm">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-3">
          Items ({order.items?.length})
        </h2>
        <div className="space-y-2">
          {order.items?.map(oi => (
            <div
              key={oi.id}
              className="flex items-center justify-between text-sm py-1.5 border-b border-charcoal-50 last:border-0"
            >
              <span className="text-charcoal-700 font-body">
                {oi.foodItem?.name}{' '}
                <span className="text-charcoal-400">× {oi.quantity}</span>
              </span>
              <span className="font-semibold text-charcoal-900">
                {formatCurrency(oi.unitPrice * oi.quantity)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2">
            <span className="text-charcoal-900">Total</span>
            <span style={{ color: '#d97706' }}>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Special instructions */}
      {order.specialInstructions && (
        <div
          className="rounded-2xl p-4"
          style={{ background: '#fffbeb', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <p className="text-xs font-bold text-amber-700 font-body mb-1">📝 Special Instructions</p>
          <p className="text-sm text-amber-800 font-body">{order.specialInstructions}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Link to="/orders" className="btn-secondary flex-1 text-center py-3 text-sm">
          ← All Orders
        </Link>
        {!isTerminal ? (
          <button onClick={refresh} className="btn-primary flex-1 py-3 text-sm">
            🔄 Refresh
          </button>
        ) : (
          <Link to="/menu" className="btn-gold flex-1 text-center py-3 text-sm">
            Order Again →
          </Link>
        )}
      </div>
    </div>
  );
}
