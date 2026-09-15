import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setSummary(res.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = [
    { label: 'Active Orders', value: summary?.activeOrders ?? 0, icon: '🔥', color: 'bg-red-50 text-red-700', link: '/admin/orders?status=PREPARING' },
    { label: "Today's Orders", value: summary?.todayOrders ?? 0, icon: '📋', color: 'bg-blue-50 text-blue-700', link: '/admin/orders' },
    { label: 'Pending Approval', value: summary?.pendingOrders ?? 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-700', link: '/admin/orders?status=PENDING' },
    { label: "Today's Revenue", value: formatCurrency(summary?.todayRevenue ?? 0), icon: '💰', color: 'bg-green-50 text-green-700', link: '/admin/analytics' },
    { label: 'Total Students', value: summary?.totalStudents ?? 0, icon: '👥', color: 'bg-purple-50 text-purple-700', link: '#' },
    { label: 'Menu Items', value: summary?.menuItemCount ?? 0, icon: '🍽️', color: 'bg-orange-50 text-orange-700', link: '/admin/menu' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Real-time canteen performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.link} className={`${s.color} rounded-2xl p-5 hover:opacity-90 transition-opacity`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/kitchen', icon: '👨‍🍳', label: 'Kitchen Queue' },
            { to: '/admin/orders', icon: '📋', label: 'All Orders' },
            { to: '/admin/menu', icon: '🍽️', label: 'Manage Menu' },
            { to: '/admin/predictions', icon: '🤖', label: 'AI Predictions' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-center">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {summary?.pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-yellow-800">{summary.pendingOrders} order(s) waiting for acceptance</p>
                <p className="text-yellow-700 text-sm">Review and accept pending orders quickly</p>
              </div>
            </div>
            <Link to="/admin/orders" className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-700 transition-colors flex-shrink-0">
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
