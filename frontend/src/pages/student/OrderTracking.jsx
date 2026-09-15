import { useParams, Link } from 'react-router-dom';
import { useOrderPolling } from '../../hooks/useOrderPolling';
import { formatCurrency, formatTime, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'];
const STATUS_INFO = {
  PENDING:   { icon: '⏳', msg: 'Waiting for the canteen to accept your order.',        color: 'text-yellow-600' },
  ACCEPTED:  { icon: '✅', msg: 'Order accepted — queued for preparation.',              color: 'text-blue-600'   },
  PREPARING: { icon: '👨‍🍳', msg: 'Your food is being prepared in the kitchen.',          color: 'text-orange-600' },
  READY:     { icon: '🔔', msg: 'Your order is ready! Please collect at the counter.',  color: 'text-green-600'  },
  COLLECTED: { icon: '🎊', msg: 'Order collected. Enjoy your meal!',                    color: 'text-gray-600'   },
  CANCELLED: { icon: '❌', msg: 'This order has been cancelled.',                       color: 'text-red-600'    },
};

export default function OrderTracking() {
  const { token } = useParams();
  const { data, loading, error, refresh } = useOrderPolling(token, 15000);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error || !data?.order) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-600 font-semibold mb-1">{error || `Order not found: ${token}`}</p>
        <Link to="/orders" className="text-primary-600 hover:underline text-sm">← Back to Order History</Link>
      </div>
    );
  }

  const { order, tracking } = data;
  const statusIdx = STATUS_STEPS.indexOf(order.status);
  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.PENDING;
  const isTerminal = ['COLLECTED', 'CANCELLED'].includes(order.status);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">📍 Order Tracking</h1>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {!isTerminal && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
              Live · auto-refreshes
            </span>
          )}
        </div>
      </div>

      {/* Token */}
      <div className="card text-center bg-gradient-to-br from-primary-50 to-orange-50 border-primary-100">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">Order Token</p>
        <p className="text-4xl font-extrabold text-primary-700 tracking-widest mb-1">{order.token}</p>
        <p className="text-xs text-gray-400">Show this at the canteen counter when collecting</p>
      </div>

      {/* Status Card */}
      <div className={`card border-2 transition-all ${order.status === 'READY' ? 'border-green-400 bg-green-50' : 'border-transparent'}`}>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-4xl">{statusInfo.icon}</span>
          <div>
            <StatusBadge status={order.status} />
            <p className={`text-sm mt-1.5 font-medium ${statusInfo.color}`}>{tracking?.statusMessage || statusInfo.msg}</p>
          </div>
        </div>

        {/* Progress steps */}
        {order.status !== 'CANCELLED' && (
          <div>
            <div className="relative flex items-start justify-between mb-1">
              {/* Connector line behind the dots */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-primary-500 transition-all duration-700"
                  style={{ width: `${Math.max(0, statusIdx) * 25}%` }}
                />
              </div>
              {STATUS_STEPS.map((s, i) => {
                const done = i < statusIdx;
                const active = i === statusIdx;
                return (
                  <div key={s} className="flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-primary-600 text-white' : active ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-100 text-gray-400'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="text-xs text-gray-400 text-center w-12 leading-tight hidden sm:block">
                      {s === 'COLLECTED' ? 'Done' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Countdown */}
        {tracking?.minutesUntilPickup > 0 && !isTerminal && (
          <div className="mt-5 text-center bg-primary-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-0.5">Pickup in approximately</p>
            <p className="text-3xl font-bold text-primary-600">{tracking.minutesUntilPickup} min</p>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { label: 'Pickup Time', value: formatTime(order.pickupTime) },
            { label: 'Est. Prep', value: `${order.estimatedPrepTime} min` },
            { label: 'Ordered', value: formatDateTime(order.createdAt).split(',')[1]?.trim() },
            { label: 'Amount', value: formatCurrency(order.totalAmount) },
          ].map((info) => (
            <div key={info.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{info.label}</p>
              <p className="font-bold text-gray-900 text-sm">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">Items ({order.items.length})</h2>
        <div className="space-y-2">
          {order.items.map((oi) => (
            <div key={oi.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{oi.foodItem.name} <span className="text-gray-400">× {oi.quantity}</span></span>
              <span className="font-semibold text-gray-900">{formatCurrency(oi.unitPrice * oi.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-1">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Special instructions */}
      {order.specialInstructions && (
        <div className="card bg-amber-50 border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1">📝 Special Instructions</p>
          <p className="text-sm text-amber-800">{order.specialInstructions}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Link to="/orders" className="btn-secondary flex-1 text-center py-3 text-sm">← All Orders</Link>
        {!isTerminal
          ? <button onClick={refresh} className="btn-primary flex-1 py-3 text-sm">🔄 Refresh</button>
          : <Link to="/menu" className="btn-primary flex-1 text-center py-3 text-sm">Order Again →</Link>
        }
      </div>
    </div>
  );
}
