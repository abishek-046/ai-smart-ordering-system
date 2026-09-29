import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const home      = user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
          style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}
        >
          🍽️
        </div>
        <h1 className="font-display text-7xl font-bold text-charcoal-200 mb-2">404</h1>
        <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-2">Page Not Found</h2>
        <p className="text-charcoal-500 font-body mb-8 leading-relaxed">
          Looks like this page doesn't exist — maybe it was moved or you typed the URL wrong.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary px-6"
          >
            ← Go Back
          </button>
          <Link to={home} className="btn-gold px-6">
            🏠 Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
