import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🍽️</div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          Looks like this page doesn't exist — maybe it was moved or you typed the URL wrong.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary px-6">← Go Back</button>
          <Link to={home} className="btn-primary px-6">🏠 Go Home</Link>
        </div>
      </div>
    </div>
  );
}
