import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { formatTime, formatCurrency, getApiError } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const NEXT = { PENDING:'ACCEPTED', ACCEPTED:'PREPARING', PREPARING:'READY' };
const NEXT_LABEL = { PENDING:'✓ Accept', ACCEPTED:'🍳 Start Prep', PREPARING:'🔔 Mark Ready' };

export default function KitchenQueue() {
  const [queue, setQueue]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchQueue = useCallback(() => {
    adminApi.getKitchenQueue()
      .then(r => setQueue(r.data.queue))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQueue();
    const t = setInterval(fetchQueue, 20000);
    return () => clearInterval(t);
  }, [fetchQueue]);

  const handleUpdate = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await adminApi.updateOrderStatus(id, status);
      toast.success(`Order ${status.toLowerCase()}`);
      fetchQueue();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setUpdating(p => ({ ...p, [id]: false })); }
  };

  const borderColor = (o) => o.isOverdue ? '#ef4444' : o.isUrgent ? '#f97316' : o.status === 'PREPARING' ? '#3b82f6' : 'rgba(0,0,0,0.08)';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Kitchen Queue</h2>
          <p className="text-charcoal-400 text-sm font-body flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Live · {queue.length} active · refreshes every 20s
          </p>
        </div>
        <button onClick={fetchQueue} className="btn-secondary text-sm py-2 px-4">🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-display text-xl font-bold text-charcoal-700">Kitchen is clear!</p>
          <p className="text-charcoal-400 text-sm font-body mt-1">No active orders right now</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map(order => (
            <div key={order.id} className="card flex flex-col"
                 style={{ borderLeft: `4px solid ${borderColor(order)}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-charcoal-900 text-lg">{order.token}</p>
                  <p className="text-sm text-charcoal-600 font-semibold">{order.user?.name}</p>
                  {order.user?.studentId && <p className="text-xs text-charcoal-400 font-body">{order.user.studentId}</p>}
                </div>
                <StatusBadge status={order.status} />
              </div>

              {order.isOverdue && (
                <div className="text-xs font-bold rounded-xl px-3 py-1.5 mb-2"
                     style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ OVERDUE — {Math.abs(order.minutesUntilPickup)} min late
                </div>
              )}
              {order.isUrgent && !order.isOverdue && (
                <div className="text-xs font-bold rounded-xl px-3 py-1.5 mb-2"
                     style={{ background: 'rgba(249,115,22,0.1)', color: '#ea580c', border: '1px solid rgba(249,115,22,0.2)' }}>
                  🔔 Pickup in {order.minutesUntilPickup} min
                </div>
              )}

              <div className="text-sm text-charcoal-500 font-body mb-3">
                ⏰ Pickup: <span className="font-bold text-charcoal-900">{formatTime(order.pickupTime)}</span>
              </div>

              <div className="flex-1 space-y-1.5 mb-3">
                {order.items.map(oi => (
                  <div key={oi.id} className="flex items-center gap-2 text-sm font-body">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                      {oi.quantity}
                    </span>
                    <span className="text-charcoal-700 font-medium">{oi.foodItem.name}</span>
                    <span className="text-charcoal-400 text-xs ml-auto">{oi.foodItem.prepTimeMinutes}m</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-charcoal-400 font-body mb-3">{formatCurrency(order.totalAmount)}</div>

              {NEXT[order.status] && (
                <button onClick={() => handleUpdate(order.id, NEXT[order.status])}
                        disabled={updating[order.id]}
                        className="btn-gold text-sm w-full flex items-center justify-center gap-2 py-2.5">
                  {updating[order.id] ? <Spinner size="sm" color="white" /> : NEXT_LABEL[order.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
