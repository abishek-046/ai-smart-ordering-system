import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/admin/orders', label: 'Orders', icon: '📋' },
    { to: '/admin/kitchen', label: 'Kitchen Queue', icon: '👨‍🍳' },
    { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/predictions', label: 'AI Predictions', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-50 flex flex-col transition-transform duration-200`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">🍽️ SmartCanteen</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✕</button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-sm text-gray-400 hover:text-red-400 transition-colors">🚪 Logout</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">☰</button>
          <h1 className="text-lg font-bold text-gray-900 md:ml-0 ml-3">Admin Dashboard</h1>
          <span className="text-sm text-gray-500">Welcome back, {user?.name?.split(' ')[0]}</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
