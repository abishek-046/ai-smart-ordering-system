import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const STATUSES = ['ALL','PENDING','ACCEPTED','PREPARING','READY','COLLECTED','CANCELLED'];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'ALL' ? { status: filter } : {};
    orderApi.getAll(params)
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Order History</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">{total} orders total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={s === filter ? 'cat-tab-active' : 'cat-tab-inactive'}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-display text-xl font-bold text-charcoal-700 mb-2">No orders found</h3>
          <Link to="/menu" className="btn-primary mt-4 text-sm px-6 inline-block">Order now →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card hover:border-primary-200 transition-all duration-200"
                 style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-mono font-bold text-charcoal-900 text-sm">{order.token}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-charcoal-400 font-body">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className="font-display font-bold text-xl flex-shrink-0" style={{ color: '#d97706' }}>
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                {order.items.slice(0, 3).map(oi => (
                  <div key={oi.id} className="flex justify-between text-sm font-body">
                    <span className="text-charcoal-600">{oi.foodItem.name} × {oi.quantity}</span>
                    <span className="text-charcoal-400">{formatCurrency(oi.unitPrice * oi.quantity)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-charcoal-400 font-body">+{order.items.length - 3} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-400 font-body">Pickup: {formatTime(order.pickupTime)}</span>
                <Link to={`/track/${order.token}`}
                      className="font-semibold transition-colors"
                      style={{ color: '#d97706' }}>
                  {['PENDING','ACCEPTED','PREPARING','READY'].includes(order.status) ? 'Track Live →' : 'View Details →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
