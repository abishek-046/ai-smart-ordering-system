import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { formatTime, formatCurrency, getApiError } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const NEXT = { PENDING: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY' };
const NEXT_LABEL = { PENDING: '✓ Accept', ACCEPTED: '🍳 Start Prep', PREPARING: '🔔 Mark Ready' };

export default function KitchenQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchQueue = useCallback(() => {
    adminApi.getKitchenQueue()
      .then((res) => setQueue(res.data.queue))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 20000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleUpdate = async (orderId, status) => {
    setUpdating((p) => ({ ...p, [orderId]: true }));
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success(`Order ${status.toLowerCase()}`);
      fetchQueue();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUpdating((p) => ({ ...p, [orderId]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👨‍🍳 Kitchen Queue</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            Live · {queue.length} active orders · auto-refreshes every 20s
          </p>
        </div>
        <button onClick={fetchQueue} className="btn-secondary text-sm px-4 py-2">🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 card"><div className="text-5xl mb-3">✅</div><p className="font-semibold text-gray-700">Kitchen is clear!</p><p className="text-gray-400 text-sm">No active orders right now</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((order) => (
            <div key={order.id} className={`card flex flex-col border-l-4 ${
              order.isOverdue ? 'border-l-red-500 bg-red-50' :
              order.isUrgent ? 'border-l-orange-400 bg-orange-50' :
              order.status === 'PREPARING' ? 'border-l-blue-400' :
              order.status === 'ACCEPTED' ? 'border-l-green-400' : 'border-l-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{order.token}</p>
                  <p className="text-sm text-gray-600">{order.user?.name}</p>
                  {order.user?.studentId && <p className="text-xs text-gray-400">{order.user.studentId}</p>}
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Urgency banner */}
              {order.isOverdue && (
                <div className="bg-red-100 text-red-700 text-xs font-bold rounded-lg px-3 py-1.5 mb-2">⚠️ OVERDUE — {Math.abs(order.minutesUntilPickup)} min late</div>
              )}
              {order.isUrgent && !order.isOverdue && (
                <div className="bg-orange-100 text-orange-700 text-xs font-bold rounded-lg px-3 py-1.5 mb-2">🔔 Pickup in {order.minutesUntilPickup} min</div>
              )}

              <div className="text-sm text-gray-500 mb-3">
                ⏰ Pickup: <span className="font-semibold text-gray-800">{formatTime(order.pickupTime)}</span>
                {order.minutesUntilPickup > 0 && !order.isOverdue && <span className="ml-1 text-xs">({order.minutesUntilPickup}m)</span>}
              </div>

              {/* Items */}
              <div className="flex-1 space-y-1 mb-3">
                {order.items.map((oi) => (
                  <div key={oi.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{oi.quantity}</span>
                    <span className="text-gray-700 font-medium">{oi.foodItem.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{oi.foodItem.prepTimeMinutes}m</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-400 mb-3">{formatCurrency(order.totalAmount)}</div>

              {NEXT[order.status] && (
                <button
                  onClick={() => handleUpdate(order.id, NEXT[order.status])}
                  disabled={updating[order.id]}
                  className="btn-primary text-sm w-full flex items-center justify-center gap-2"
                >
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
