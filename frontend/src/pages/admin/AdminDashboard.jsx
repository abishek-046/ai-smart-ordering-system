import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const STATS = [
  { key: 'activeOrders',   label: 'Active Orders',   icon: '🔥', bg: '#fef2f2', border: 'rgba(239,68,68,0.2)',    text: '#dc2626', link: '/admin/orders'    },
  { key: 'todayOrders',    label: "Today's Orders",  icon: '📋', bg: '#eff6ff', border: 'rgba(59,130,246,0.2)',   text: '#2563eb', link: '/admin/orders'    },
  { key: 'pendingOrders',  label: 'Awaiting Accept', icon: '⏳', bg: '#fffbeb', border: 'rgba(217,119,6,0.2)',    text: '#d97706', link: '/admin/orders'    },
  { key: 'todayRevenue',   label: "Today's Revenue", icon: '💰', bg: '#f0fdf4', border: 'rgba(34,197,94,0.2)',    text: '#16a34a', link: '/admin/analytics', isCurrency: true },
  { key: 'totalStudents',  label: 'Students',        icon: '👥', bg: '#faf5ff', border: 'rgba(139,92,246,0.2)',   text: '#7c3aed', link: '#'               },
  { key: 'menuItemCount',  label: 'Menu Items',      icon: '🍽️', bg: '#fff7ed', border: 'rgba(217,119,6,0.15)',   text: '#d97706', link: '/admin/menu'      },
];

const QUICK = [
  { to: '/admin/kitchen',     icon: '👨‍🍳', label: 'Kitchen Queue',  desc: 'Active orders' },
  { to: '/admin/orders',      icon: '📋', label: 'All Orders',      desc: 'Manage orders' },
  { to: '/admin/menu',        icon: '🍽️', label: 'Manage Menu',     desc: 'Add / edit items' },
  { to: '/admin/predictions', icon: '🤖', label: 'AI Predictions',  desc: 'Load forecast' },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminApi.getDashboard()
      .then(r => setSummary(r.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Dashboard Overview</h2>
          <p className="text-charcoal-400 font-body text-sm mt-0.5">Real-time canteen performance</p>
        </div>
        <button
          onClick={refresh}
          className="text-sm text-charcoal-500 hover:text-charcoal-900 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map(s => (
          <Link
            key={s.key}
            to={s.link}
            className="rounded-3xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{s.icon}</span>
            </div>
            <p className="font-display font-bold text-2xl text-charcoal-900">
              {s.isCurrency
                ? formatCurrency(summary?.[s.key] ?? 0)
                : (summary?.[s.key] ?? 0)}
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: s.text }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending alert */}
      {(summary?.pendingOrders ?? 0) > 0 && (
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg,rgba(217,119,6,0.09),rgba(245,158,11,0.04))',
            border: '2px solid rgba(217,119,6,0.35)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🔔</span>
              <div>
                <p className="font-display font-bold text-charcoal-900 text-lg">
                  {summary.pendingOrders} order{summary.pendingOrders > 1 ? 's' : ''} waiting for acceptance
                </p>
                <p className="text-charcoal-600 text-sm font-body">
                  Accept quickly so the kitchen can start preparing
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="flex-shrink-0 font-bold text-sm py-2.5 px-5 rounded-2xl text-white transition-all hover:shadow-gold"
              style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}
            >
              Accept Now →
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(a => (
            <Link
              key={a.to}
              to={a.to}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card text-center"
              style={{ background: '#fdf8f0', border: '1px solid rgba(217,119,6,0.1)' }}
            >
              <span className="text-3xl">{a.icon}</span>
              <div>
                <p className="text-xs font-bold text-charcoal-900">{a.label}</p>
                <p className="text-xs text-charcoal-400 font-body mt-0.5">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
