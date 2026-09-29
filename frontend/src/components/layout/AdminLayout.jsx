import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const NAV = [
  { to: '/admin',             label: 'Dashboard',     icon: '📊', exact: true },
  { to: '/admin/orders',      label: 'Orders',        icon: '📋' },
  { to: '/admin/kitchen',     label: 'Kitchen Queue', icon: '👨‍🍳' },
  { to: '/admin/menu',        label: 'Menu',          icon: '🍽️' },
  { to: '/admin/analytics',   label: 'Analytics',     icon: '📈' },
  { to: '/admin/predictions', label: 'AI Predictions',icon: '🤖' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex font-sans" style={{ background: '#f5f2ed' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                         fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col
                         transition-transform duration-300 ease-in-out`}
             style={{ background: 'linear-gradient(180deg,#0f0a06 0%,#1a1208 60%,#140e06 100%)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
             style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                 style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
              🍽️
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-none">SmartCanteen</p>
              <p className="text-xs mt-0.5 font-body" style={{ color: 'rgba(245,158,11,0.7)' }}>Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-charcoal-400 hover:text-white text-lg transition-colors">
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(l => (
            <NavLink key={l.to} to={l.to} end={l.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-amber-400 border-l-2 border-amber-400 pl-3.5'
                    : 'text-charcoal-400 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(245,158,11,0.1)' } : {}}
              onClick={() => setSidebarOpen(false)}>
              <span className="text-lg">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Gold divider */}
        <div className="gold-divider mx-4" />

        {/* User info */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(245,158,11,0.7)' }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-charcoal-400 hover:text-red-400 hover:bg-red-500/10">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-charcoal-100 px-6 py-4 flex items-center justify-between"
                style={{ background: 'rgba(245,242,237,0.97)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 rounded-xl hover:bg-charcoal-100 transition-colors text-charcoal-600">
              ☰
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-charcoal-900">Admin Dashboard</h1>
              <p className="text-xs text-charcoal-400 font-body mt-0.5">Manage your canteen operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                 style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                   style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
                {user?.name?.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-charcoal-700">
                {user?.name?.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
