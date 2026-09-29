import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard',      label: 'Home',       icon: '🏠' },
  { to: '/menu',           label: 'Menu',        icon: '🍽️' },
  { to: '/recommendations',label: 'AI Picks',    icon: '🤖' },
  { to: '/orders',         label: 'Orders',      icon: '📋' },
  { to: '/profile',        label: 'Profile',     icon: '👤' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream font-sans">

      {/* ── Top Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-charcoal-100/60 backdrop-blur-md"
           style={{ background: 'rgba(253,248,240,0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                🍽️
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-charcoal-900 leading-none text-base">SmartCanteen</p>
                <p className="text-xs text-charcoal-400 leading-none mt-0.5 font-body">AI-Powered Ordering</p>
              </div>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV.map(l => (
                <NavLink key={l.to} to={l.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                    }`
                  }>
                  <span className="text-base">{l.icon}</span>
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <NavLink to="/cart" className="relative p-2.5 rounded-xl hover:bg-charcoal-50 transition-colors">
                <span className="text-xl">🛒</span>
                {cart.totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                    {cart.totalItems > 9 ? '9+' : cart.totalItems}
                  </span>
                )}
              </NavLink>

              {/* Avatar / dropdown */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-charcoal-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-charcoal-700">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="text-charcoal-400 text-xs">▾</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-charcoal-100 py-2 z-50"
                         style={{ background: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                      <div className="px-4 py-3 border-b border-charcoal-50">
                        <p className="text-sm font-bold text-charcoal-900 truncate">{user?.name}</p>
                        <p className="text-xs text-charcoal-400 truncate mt-0.5">{user?.email}</p>
                        {user?.studentId && <p className="text-xs text-primary-600 font-medium mt-0.5">{user.studentId}</p>}
                      </div>
                      <div className="py-1">
                        <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 flex items-center gap-2 font-medium">
                          ⚙️ Settings
                        </button>
                        <button onClick={() => { navigate('/orders'); setMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 flex items-center gap-2 font-medium">
                          📋 My Orders
                        </button>
                        <div className="border-t border-charcoal-50 mt-1 pt-1">
                          <button onClick={handleLogout}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-charcoal-100"
           style={{ background: 'rgba(253,248,240,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { to: '/dashboard', label: 'Home',   icon: '🏠' },
            { to: '/menu',      label: 'Menu',   icon: '🍽️' },
            { to: '/orders',    label: 'Orders', icon: '📋' },
            { to: '/profile',   label: 'Profile',icon: '👤' },
          ].map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-primary-600' : 'text-charcoal-500'
                }`
              }>
              <span className="text-xl">{l.icon}</span>
              <span className="text-xs font-semibold">{l.label}</span>
            </NavLink>
          ))}
          {/* Cart tab */}
          <NavLink to="/cart"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative ${
                isActive ? 'text-primary-600' : 'text-charcoal-500'
              }`
            }>
            <span className="text-xl">🛒</span>
            <span className="text-xs font-semibold">Cart</span>
            {cart.totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', fontSize: '9px' }}>
                {cart.totalItems}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </div>
  );
}
