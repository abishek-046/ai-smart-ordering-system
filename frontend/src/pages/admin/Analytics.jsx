import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { formatCurrency, getCategoryEmoji } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-400',
  ACCEPTED: 'bg-blue-400',
  PREPARING: 'bg-orange-400',
  READY: 'bg-green-400',
  COLLECTED: 'bg-green-600',
  CANCELLED: 'bg-red-400',
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    adminApi.getAnalytics(days)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📈 Analytics</h1>
          <p className="text-sm text-gray-500">{data?.period}</p>
        </div>
        <select className="input-field w-auto" value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
          <option value={1}>Today</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Orders', value: data?.summary.totalOrders ?? 0, icon: '📋', color: 'bg-blue-50' },
              { label: "Today's Orders", value: data?.summary.todayOrders ?? 0, icon: '📅', color: 'bg-purple-50' },
              { label: 'Revenue', value: formatCurrency(data?.summary.totalRevenue ?? 0), icon: '💰', color: 'bg-green-50' },
              { label: 'Completion Rate', value: `${data?.summary.completionRate ?? 0}%`, icon: '✅', color: 'bg-emerald-50' },
              { label: 'Avg Prep Time', value: `${data?.summary.avgPrepTimeMinutes ?? 0} min`, icon: '⏱️', color: 'bg-orange-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders by status */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Orders by Status</h2>
              {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => {
                    const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0);
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{status}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${STATUS_COLORS[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-gray-400 text-sm">No order data yet</p>}
            </div>

            {/* Top items */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">🏆 Top Selling Items</h2>
              {data?.topItems?.length > 0 ? (
                <div className="space-y-3">
                  {data.topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">{i + 1}</span>
                      <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                      <span className="font-bold text-gray-700">{item.totalOrdered} sold</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No sales data yet</p>}
            </div>
          </div>

          {/* Hourly distribution */}
          {data?.hourlyDistribution?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">📊 Orders by Hour</h2>
              <div className="flex items-end gap-1 h-32">
                {Array.from({ length: 24 }, (_, h) => {
                  const found = data.hourlyDistribution.find((d) => Number(d.hour) === h);
                  const count = found ? Number(found.count) : 0;
                  const max = Math.max(...data.hourlyDistribution.map((d) => Number(d.count)), 1);
                  const height = Math.round((count / max) * 100);
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full rounded-t transition-all ${count > 0 ? 'bg-primary-400' : 'bg-gray-100'}`} style={{ height: `${Math.max(4, height)}%` }} title={`${h}:00 — ${count} orders`} />
                      {h % 6 === 0 && <span className="text-xs text-gray-400">{h}h</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
