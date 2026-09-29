import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { formatCurrency, getCategoryEmoji } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const BAR_COLOR = { PENDING:'#f59e0b', ACCEPTED:'#3b82f6', PREPARING:'#f97316', READY:'#22c55e', COLLECTED:'#16a34a', CANCELLED:'#ef4444' };

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]     = useState(7);

  useEffect(() => {
    setLoading(true);
    adminApi.getAnalytics(days)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Analytics</h2>
          <p className="text-charcoal-400 text-sm font-body">{data?.period}</p>
        </div>
        <select className="input-field w-auto text-sm" value={days} onChange={e => setDays(parseInt(e.target.value))}>
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
              { label:'Total Orders',    value: data?.summary.totalOrders ?? 0,       icon:'📋', bg:'#eff6ff' },
              { label:"Today's Orders",  value: data?.summary.todayOrders ?? 0,        icon:'📅', bg:'#faf5ff' },
              { label:'Revenue',         value: formatCurrency(data?.summary.totalRevenue ?? 0), icon:'💰', bg:'#f0fdf4' },
              { label:'Completion Rate', value: `${data?.summary.completionRate ?? 0}%`, icon:'✅', bg:'#ecfdf5' },
              { label:'Avg Prep Time',   value: `${data?.summary.avgPrepTimeMinutes ?? 0} min`, icon:'⏱️', bg:'#fff7ed' },
            ].map(s => (
              <div key={s.label} className="rounded-3xl p-5 text-center" style={{ background: s.bg }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-display font-bold text-xl text-charcoal-900">{s.value}</p>
                <p className="text-xs text-charcoal-500 font-body mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders by status */}
            <div className="card">
              <h3 className="font-display font-bold text-charcoal-900 mb-5">Orders by Status</h3>
              {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => {
                    const total = Object.values(data.ordersByStatus).reduce((a,b) => a+b, 0);
                    const pct = total ? Math.round((count/total)*100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm font-body mb-1">
                          <span className="font-semibold text-charcoal-700">{status}</span>
                          <span className="text-charcoal-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{ width:`${pct}%`, background: BAR_COLOR[status] || '#9d8d74' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-charcoal-400 text-sm font-body">No data yet</p>}
            </div>

            {/* Top items */}
            <div className="card">
              <h3 className="font-display font-bold text-charcoal-900 mb-5">🏆 Top Selling Dishes</h3>
              {data?.topItems?.length > 0 ? (
                <div className="space-y-3">
                  {data.topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>{i+1}</span>
                      <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-charcoal-900 font-display">{item.name}</p>
                        <p className="text-xs text-charcoal-400 font-body">{item.category}</p>
                      </div>
                      <span className="font-bold text-charcoal-700 text-sm">{item.totalOrdered} sold</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-charcoal-400 text-sm font-body">No sales data yet</p>}
            </div>
          </div>

          {/* Hourly chart */}
          {data?.hourlyDistribution?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-charcoal-900 mb-5">📊 Orders by Hour</h3>
              <div className="flex items-end gap-1 h-32">
                {Array.from({ length: 24 }, (_, h) => {
                  const found = data.hourlyDistribution.find(d => Number(d.hour) === h);
                  const count = found ? Number(found.count) : 0;
                  const max = Math.max(...data.hourlyDistribution.map(d => Number(d.count)), 1);
                  const pct = Math.round((count/max)*100);
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-t-sm transition-all"
                           style={{ height: `${Math.max(4,pct)}%`, background: count > 0 ? 'linear-gradient(0deg,#d97706,#f59e0b)' : '#f0ede6' }}
                           title={`${h}:00 — ${count} orders`} />
                      {h % 6 === 0 && <span className="text-xs text-charcoal-400 font-body">{h}h</span>}
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
