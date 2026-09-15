import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/menu', label: 'Menu', icon: '🍽️' },
    { to: '/recommendations', label: 'AI Picks', icon: '🤖' },
    { to: '/orders', label: 'My Orders', icon: '📋' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-600">
              <span className="text-2xl">🍽️</span>
              <span className="hidden sm:inline">SmartCanteen</span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }
                >
                  {l.icon} {l.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Cart */}
              <NavLink to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <span className="text-xl">🛒</span>
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cart.totalItems > 9 ? '9+' : cart.totalItems}
                  </span>
                )}
              </NavLink>

              {/* User menu */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm text-gray-700 font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Settings</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">🚪 Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-up">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500'}`
              }
            >
              <span className="text-lg">{l.icon}</span>
              <span className="text-xs font-medium">{l.label}</span>
            </NavLink>
          ))}
          <NavLink to="/cart" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
            <span className="text-lg">🛒</span>
            <span className="text-xs font-medium">Cart</span>
            {cart.totalItems > 0 && (
              <span className="absolute top-0 right-1 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cart.totalItems}
              </span>
            )}
          </NavLink>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
