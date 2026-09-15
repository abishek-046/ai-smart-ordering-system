import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'ALL' ? { status: filter } : {};
    orderApi.getAll(params)
      .then((res) => { setOrders(res.data.orders); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Order History</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} orders total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No orders found</p>
          <Link to="/menu" className="btn-primary mt-4 inline-block text-sm px-5">Order now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-900">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className="font-bold text-primary-600 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.slice(0, 3).map((oi) => (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{oi.foodItem.name} × {oi.quantity}</span>
                    <span className="text-gray-400">{formatCurrency(oi.unitPrice * oi.quantity)}</span>
                  </div>
                ))}
                {order.items.length > 3 && <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pickup: {formatTime(order.pickupTime)}</span>
                <Link to={`/track/${order.token}`} className="text-primary-600 font-semibold hover:underline">
                  {['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status) ? 'Track →' : 'View Details →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
