import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime, getApiError } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
const NEXT_STATUS = { PENDING: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY', READY: 'COLLECTED' };
const NEXT_LABEL = { PENDING: 'Accept', ACCEPTED: 'Start Prep', PREPARING: 'Mark Ready', READY: 'Mark Collected' };

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [total, setTotal] = useState(0);
  const statusFilter = searchParams.get('status') || 'ALL';

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
    adminApi.getOrders(params)
      .then((res) => { setOrders(res.data.orders); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 30s when viewing pending/active orders
  useEffect(() => {
    const active = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING'].includes(statusFilter);
    if (!active) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating((p) => ({ ...p, [orderId]: true }));
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} orders found</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm px-4 py-2">🔄 Refresh</button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setSearchParams(s !== 'ALL' ? { status: s } : {})}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card"><div className="text-4xl mb-3">📭</div><p className="text-gray-500">No orders found</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 font-medium">{order.user?.name}</p>
                  {order.user?.studentId && <p className="text-xs text-gray-400">ID: {order.user.studentId}</p>}
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary-600 text-lg">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-gray-500">Pickup: {formatTime(order.pickupTime)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                {order.items.map((oi) => (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{oi.foodItem.name} × {oi.quantity}</span>
                    <span className="text-gray-500 text-xs">{oi.foodItem.category}</span>
                  </div>
                ))}
              </div>

              {order.specialInstructions && (
                <p className="text-xs bg-yellow-50 border border-yellow-100 rounded-lg p-2 mb-3 text-yellow-800">
                  📝 {order.specialInstructions}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, NEXT_STATUS[order.status])}
                    disabled={updating[order.id]}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                  >
                    {updating[order.id] ? <Spinner size="sm" color="white" /> : `✓ ${NEXT_LABEL[order.status]}`}
                  </button>
                )}
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                    disabled={updating[order.id]}
                    className="btn-danger text-sm px-4 py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
