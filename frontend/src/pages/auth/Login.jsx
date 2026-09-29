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

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setError(''); };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#fdf8f0 0%,#fef9f0 50%,#fff 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 hero-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
             style={{ background: 'radial-gradient(circle at 30% 50%,#f59e0b,transparent 60%)' }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="text-7xl mb-6 animate-float">🍽️</div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">SmartCanteen</h2>
          <p className="text-charcoal-300 font-body leading-relaxed">
            Pre-order, skip the queue, and enjoy your meal — all in under 30 seconds.
          </p>
          <div className="mt-8 space-y-3">
            {['33 Authentic Dishes','AI Pickup Prediction','Live Order Tracking'].map(f => (
              <div key={f} className="flex items-center gap-3 text-charcoal-300 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.25)', color: '#f59e0b' }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <span className="text-2xl">🍽️</span>
              <span className="font-display font-bold text-charcoal-900 text-xl">SmartCanteen</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-2">Welcome back</h1>
            <p className="text-charcoal-500 font-body">Sign in to your account</p>
          </div>

          {/* Demo creds */}
          <div className="rounded-2xl p-4 mb-6 border" style={{ background: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.2)' }}>
            <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wide">🔑 Demo Credentials</p>
            <div className="space-y-1 text-xs text-primary-800 font-body">
              <p>Student: <span className="font-mono bg-primary-50 px-1 rounded">student@test.com</span> / <span className="font-mono bg-primary-50 px-1 rounded">student123</span></p>
              <p>Admin: <span className="font-mono bg-primary-50 px-1 rounded">admin@canteen.com</span> / <span className="font-mono bg-primary-50 px-1 rounded">admin123</span></p>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-body">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Email Address</label>
                <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={set('email')} autoFocus autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Password</label>
                <input type="password" className="input-field" placeholder="Your password" value={form.password} onChange={set('password')} autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base">
                {loading ? <><Spinner size="sm" color="white" /> Signing in...</> : 'Sign In →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-charcoal-500 mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
