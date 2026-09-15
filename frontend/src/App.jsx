import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Menu from './pages/student/Menu';
import FoodDetails from './pages/student/FoodDetails';
import Cart from './pages/student/Cart';
import AIRecommendations from './pages/student/AIRecommendations';
import SmartPickupTime from './pages/student/SmartPickupTime';
import Checkout from './pages/student/Checkout';
import OrderConfirmation from './pages/student/OrderConfirmation';
import OrderTracking from './pages/student/OrderTracking';
import OrderHistory from './pages/student/OrderHistory';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import KitchenQueue from './pages/admin/KitchenQueue';
import MenuManagement from './pages/admin/MenuManagement';
import Analytics from './pages/admin/Analytics';
import AIPredictions from './pages/admin/AIPredictions';

import NotFound from './pages/NotFound';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingScreen from './components/ui/LoadingScreen';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Student */}
      <Route path="/" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:id" element={<FoodDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="recommendations" element={<AIRecommendations />} />
        <Route path="pickup-time" element={<SmartPickupTime />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="track/:token" element={<OrderTracking />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="kitchen" element={<KitchenQueue />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="predictions" element={<AIPredictions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
