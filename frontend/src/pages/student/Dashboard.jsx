import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { formatCurrency, formatDateTime, getStatusLabel } from '../../utils/helpers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    orderApi.getAll({ limit: 5 })
      .then((res) => {
        setRecentOrders(res.data.orders);
        const active = res.data.orders.find((o) => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
        setActiveOrder(active || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-500 rounded-2xl p-6 text-white">
        <p className="text-orange-100 text-sm mb-1">{greeting}</p>
        <h1 className="text-2xl font-bold">{user?.name} 👋</h1>
        {user?.studentId && <p className="text-orange-200 text-sm mt-0.5">Student ID: {user.studentId}</p>}
        <div className="flex gap-3 mt-5">
          <Link to="/menu" className="bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors">
            🍽️ Order Food
          </Link>
          <Link to="/recommendations" className="bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-800 transition-colors">
            🤖 AI Picks
          </Link>
        </div>
      </div>

      {/* Active order banner */}
      {activeOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-semibold mb-0.5">Active Order</p>
            <p className="font-bold text-gray-900">Token: {activeOrder.token}</p>
            <StatusBadge status={activeOrder.status} />
          </div>
          <Link to={`/track/${activeOrder.token}`} className="btn-primary text-sm px-4 py-2">Track →</Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/menu', icon: '🍽️', label: 'Browse Menu', color: 'bg-orange-50 text-orange-700' },
          { to: '/cart', icon: '🛒', label: 'My Cart', color: 'bg-blue-50 text-blue-700' },
          { to: '/orders', icon: '📋', label: 'Order History', color: 'bg-green-50 text-green-700' },
          { to: '/recommendations', icon: '🤖', label: 'AI Picks', color: 'bg-purple-50 text-purple-700' },
        ].map((a) => (
          <Link key={a.to} to={a.to} className={`${a.color} rounded-2xl p-5 text-center hover:opacity-80 transition-opacity`}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <div className="text-sm font-semibold">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary-600 font-semibold hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-500">No orders yet</p>
            <Link to="/menu" className="btn-primary mt-4 inline-block text-sm px-5 py-2.5">Place your first order →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{order.token}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.items.length} item(s) · {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <Link to={`/track/${order.token}`} className="text-primary-600 text-xs font-semibold hover:underline">Track</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
