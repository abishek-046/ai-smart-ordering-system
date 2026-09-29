import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];

const ACTIVE_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'];

export default function OrderHistory() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [total, setTotal]     = useState(0);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = filter !== 'ALL' ? { status: filter } : {};
    orderApi.getAll(params)
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900">Order History</h1>
          <p className="text-charcoal-400 font-body text-sm mt-0.5">{total} order{total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors font-semibold flex items-center gap-1.5"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={f === filter ? 'cat-tab-active' : 'cat-tab-inactive'}
            aria-pressed={f === filter}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-display text-xl font-bold text-charcoal-700 mb-2">No orders found</h3>
          <p className="text-charcoal-400 font-body text-sm mb-5">
            {filter !== 'ALL' ? `No ${filter.toLowerCase()} orders` : "You haven't placed any orders yet"}
          </p>
          {filter !== 'ALL' ? (
            <button onClick={() => setFilter('ALL')} className="btn-secondary text-sm px-5">Show All</button>
          ) : (
            <Link to="/menu" className="btn-gold text-sm px-6 py-2.5 inline-block">Order Now →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isActive = ACTIVE_STATUSES.includes(order.status);
            return (
              <div
                key={order.id}
                className="card hover:shadow-card-hover transition-all duration-200"
                style={{
                  borderLeft: isActive ? '3px solid #d97706' : '3px solid transparent',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono font-bold text-charcoal-900 text-sm">
                        {order.token}
                      </span>
                      <StatusBadge status={order.status} />
                      {isActive && (
                        <span className="flex items-center gap-1 text-xs text-primary-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-400 font-body">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className="font-display font-bold text-xl flex-shrink-0"
                    style={{ color: '#d97706' }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Items list */}
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map(oi => (
                    <div key={oi.id} className="flex justify-between text-sm font-body">
                      <span className="text-charcoal-600 truncate pr-4">
                        {oi.foodItem?.name} × {oi.quantity}
                      </span>
                      <span className="text-charcoal-400 flex-shrink-0">
                        {formatCurrency(oi.unitPrice * oi.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-charcoal-400 font-body">
                      +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-2 border-t border-charcoal-50 text-sm">
                  <span className="text-charcoal-400 font-body">
                    Pickup: <span className="font-semibold text-charcoal-600">{formatTime(order.pickupTime)}</span>
                  </span>
                  <Link
                    to={`/track/${order.token}`}
                    className="font-semibold text-sm transition-colors hover:underline"
                    style={{ color: '#d97706' }}
                  >
                    {isActive ? 'Track Live →' : 'View Details →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
