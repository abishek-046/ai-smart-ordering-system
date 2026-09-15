import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      const from = location.state?.from?.pathname || (data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">🍽️ SmartCanteen</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to pre-order your food</p>
        </div>

        <div className="card shadow-md">
          {/* Demo creds hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
            <p className="font-semibold mb-1">🔑 Demo Credentials</p>
            <p>Student: <span className="font-mono">student@test.com</span> / <span className="font-mono">student123</span></p>
            <p>Admin: <span className="font-mono">admin@canteen.com</span> / <span className="font-mono">admin123</span></p>
            <p className="mt-1 text-blue-500">(Run the seed script first: <span className="font-mono">npm run seed</span>)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={set('email')} autoFocus autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input-field" placeholder="Your password" value={form.password} onChange={set('password')} autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Spinner size="sm" color="white" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
