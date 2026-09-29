import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime, getApiError } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const FILTERS    = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
const NEXT_STATUS = { PENDING: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY', READY: 'COLLECTED' };
const NEXT_LABEL  = { PENDING: 'Accept', ACCEPTED: 'Start Prep', PREPARING: 'Mark Ready', READY: 'Collected' };

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState({});
  const [total, setTotal]               = useState(0);
  const statusFilter = searchParams.get('status') || 'ALL';

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
    adminApi.getOrders(params)
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 30s for active filters
  useEffect(() => {
    if (!['ALL', 'PENDING', 'ACCEPTED', 'PREPARING'].includes(statusFilter)) return;
    const t = setInterval(fetchOrders, 30000);
    return () => clearInterval(t);
  }, [fetchOrders, statusFilter]);

  const handleUpdate = async (orderId, newStatus) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order → ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUpdating(p => ({ ...p, [orderId]: false }));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Orders</h2>
          <p className="text-charcoal-400 font-body text-sm">{total} orders found</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm py-2 px-4">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setSearchParams(f !== 'ALL' ? { status: f } : {})}
            className={statusFilter === f ? 'cat-tab-active' : 'cat-tab-inactive'}
            aria-pressed={statusFilter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-display font-bold text-charcoal-700 mb-1">No orders found</p>
          <p className="text-charcoal-400 text-sm font-body">
            {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} orders right now` : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-mono font-bold text-charcoal-900">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-semibold text-charcoal-800 text-sm">{order.user?.name}</p>
                  {order.user?.studentId && (
                    <p className="text-xs text-charcoal-400 font-body">{order.user.studentId}</p>
                  )}
                  <p className="text-xs text-charcoal-400 font-body">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-xl" style={{ color: '#d97706' }}>
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-charcoal-400 font-body">
                    Pickup: <span className="font-semibold">{formatTime(order.pickupTime)}</span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div
                className="rounded-2xl p-3 mb-3 space-y-1"
                style={{ background: '#fdf8f0', border: '1px solid rgba(217,119,6,0.08)' }}
              >
                {order.items.map(oi => (
                  <div key={oi.id} className="flex justify-between text-sm font-body">
                    <span className="text-charcoal-700">
                      {oi.foodItem?.name} × {oi.quantity}
                    </span>
                    <span className="text-charcoal-400 text-xs">{oi.foodItem?.category}</span>
                  </div>
                ))}
              </div>

              {order.specialInstructions && (
                <div
                  className="text-xs rounded-xl px-3 py-2 mb-3 font-body"
                  style={{
                    background: 'rgba(234,179,8,0.08)',
                    color: '#92400e',
                    border: '1px solid rgba(234,179,8,0.2)',
                  }}
                >
                  📝 {order.specialInstructions}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => handleUpdate(order.id, NEXT_STATUS[order.status])}
                    disabled={updating[order.id]}
                    className="btn-gold text-sm py-2 px-5 flex items-center gap-2"
                  >
                    {updating[order.id]
                      ? <Spinner size="sm" color="white" />
                      : `✓ ${NEXT_LABEL[order.status]}`}
                  </button>
                )}
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdate(order.id, 'CANCELLED')}
                    disabled={updating[order.id]}
                    className="btn-danger text-sm py-2 px-4"
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
