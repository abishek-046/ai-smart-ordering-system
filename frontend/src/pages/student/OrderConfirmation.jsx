import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Success header */}
      <div className="text-center py-8 card bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-800">Order Placed!</h1>
        <p className="text-green-600 mt-1">Your food is on its way to being prepared</p>
      </div>

      {/* Digital Token */}
      <div className="card text-center border-2 border-dashed border-primary-300 bg-primary-50">
        <p className="text-sm font-semibold text-primary-600 mb-2 uppercase tracking-wider">Your Digital Token</p>
        <p className="text-4xl font-extrabold text-primary-700 tracking-wider mb-1">{order.token}</p>
        <p className="text-xs text-gray-500">Show this token at the canteen counter</p>
      </div>

      {/* Pickup time */}
      <div className="card text-center">
        <p className="text-sm text-gray-500 mb-1">Scheduled Pickup Time</p>
        <p className="text-2xl font-bold text-gray-900">{formatTime(order.pickupTime)}</p>
        <p className="text-sm text-gray-400 mt-0.5">Est. preparation: ~{order.estimatedPrepTime} minutes</p>
      </div>

      {/* Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Order Status</h2>
          <StatusBadge status={order.status} />
        </div>
        {/* Progress bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'].map((s, i) => {
              const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'];
              const currentIdx = statuses.indexOf(order.status);
              const isDone = i <= currentIdx;
              return (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 hidden sm:block">{s.slice(0, 4)}</span>
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-gray-100 rounded absolute top-4 left-4 right-4 -z-10">
            <div className="h-full bg-primary-600 rounded transition-all" style={{ width: `${(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED'].indexOf(order.status)) * 25}%` }} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">Items Ordered</h2>
        <div className="space-y-2">
          {order.items.map((oi) => (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{oi.foodItem.name} × {oi.quantity}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(oi.unitPrice * oi.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to={`/track/${order.token}`} className="btn-primary flex-1 text-center py-3">Track Order →</Link>
        <Link to="/menu" className="btn-secondary flex-1 text-center py-3">Order More</Link>
      </div>
    </div>
  );
}
