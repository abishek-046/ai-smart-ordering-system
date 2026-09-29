import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { formatCurrency, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'];

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id)
      .then(r => setOrder(r.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );
  if (!order) return (
    <div className="text-center py-24 text-charcoal-400 font-body">Order not found.</div>
  );

  const statusIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">

      {/* Success banner */}
      <div
        className="card text-center py-10 relative overflow-hidden"
        style={{ border: '1px solid rgba(34,197,94,0.2)' }}
      >
        {/* Green top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }}
        />
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.1)' }}
        >
          🎉
        </div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900 mb-1">Order Placed!</h1>
        <p className="text-charcoal-500 font-body text-sm">Your food is now in the kitchen queue</p>
      </div>

      {/* Digital token */}
      <div
        className="rounded-3xl p-7 text-center"
        style={{
          background: 'linear-gradient(135deg,#0f0a06,#1e1208)',
          border: '1px solid rgba(245,158,11,0.25)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3 font-body"
          style={{ color: 'rgba(245,158,11,0.6)' }}
        >
          Your Digital Token
        </p>
        <p
          className="font-display font-extrabold text-5xl tracking-widest mb-2"
          style={{ color: '#f59e0b' }}
        >
          {order.token}
        </p>
        <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Show this token at the canteen counter
        </p>
      </div>

      {/* Pickup time */}
      <div className="card text-center">
        <p className="text-xs text-charcoal-400 font-body mb-2">Scheduled Pickup Time</p>
        <p className="font-display text-3xl font-bold text-charcoal-900">
          {formatTime(order.pickupTime)}
        </p>
        <p className="text-sm text-charcoal-400 font-body mt-1">
          Est. preparation: ~{order.estimatedPrepTime} minutes
        </p>
      </div>

      {/* Status progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-charcoal-900">Status</h2>
          <StatusBadge status={order.status} />
        </div>
        <div className="relative flex items-start justify-between">
          <div
            className="absolute top-3.5 left-3.5 right-3.5 h-0.5"
            style={{ background: '#f0ede6', zIndex: 0 }}
          >
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${Math.max(0, statusIdx) * 25}%`,
                background: 'linear-gradient(90deg,#d97706,#f59e0b)',
              }}
            />
          </div>
          {STATUS_STEPS.map((s, i) => {
            const done = i <= statusIdx;
            return (
              <div key={s} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: done
                      ? 'linear-gradient(135deg,#d97706,#f59e0b)'
                      : '#f0ede6',
                    color: done ? 'white' : '#9d8d74',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className="text-xs text-charcoal-400 hidden sm:block font-body text-center w-12 leading-tight">
                  {s === 'COLLECTED' ? 'Done' : s.charAt(0) + s.slice(1).toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items summary */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-3">Items Ordered</h2>
        <div className="space-y-2">
          {order.items?.map(oi => (
            <div key={oi.id} className="flex items-center justify-between text-sm font-body">
              <span className="text-charcoal-700">
                {oi.foodItem?.name}{' '}
                <span className="text-charcoal-400">× {oi.quantity}</span>
              </span>
              <span className="font-semibold text-charcoal-900">
                {formatCurrency(oi.unitPrice * oi.quantity)}
              </span>
            </div>
          ))}
          <div className="h-px bg-charcoal-100 my-1" />
          <div className="flex justify-between font-bold font-body">
            <span className="text-charcoal-900">Total</span>
            <span style={{ color: '#d97706' }}>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-2">
        <Link to={`/track/${order.token}`} className="btn-gold flex-1 text-center py-3.5">
          Track Order →
        </Link>
        <Link to="/menu" className="btn-secondary flex-1 text-center py-3.5">
          Order More
        </Link>
      </div>
    </div>
  );
}
