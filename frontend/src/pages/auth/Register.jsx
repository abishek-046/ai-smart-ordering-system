import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', studentId: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, studentId: form.studentId || undefined, phone: form.phone || undefined });
      toast.success('Welcome to SmartCanteen! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#fdf8f0 0%,#fff 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 hero-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 50%,#f59e0b,transparent 60%)' }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="text-7xl mb-6 animate-float">🥘</div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">Join SmartCanteen</h2>
          <p className="text-charcoal-300 font-body leading-relaxed mb-8">
            Create your free account and start pre-ordering in under 60 seconds.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[['33','Dishes'],['500+','Daily Orders'],['4.8★','Rating'],['70%','Less Wait']].map(([v,l]) => (
              <div key={l} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="font-display font-bold text-xl text-amber-400">{v}</p>
                <p className="text-charcoal-400 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <span className="text-2xl">🍽️</span>
              <span className="font-display font-bold text-charcoal-900 text-xl">SmartCanteen</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-2">Create account</h1>
            <p className="text-charcoal-500 font-body">Start pre-ordering in seconds</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Full Name *</label>
                <input type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="e.g. Abishek Kumar" value={form.name} onChange={set('name')} autoFocus />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Email Address *</label>
                <input type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`} placeholder="you@college.edu" value={form.email} onChange={set('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-2">Student ID</label>
                  <input type="text" className="input-field" placeholder="STU-2024-001" value={form.studentId} onChange={set('studentId')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-2">Phone</label>
                  <input type="tel" className="input-field" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Password *</label>
                <input type="password" className={`input-field ${errors.password ? 'border-red-400' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Confirm Password *</label>
                <input type="password" className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-2">
                {loading ? <><Spinner size="sm" color="white" /> Creating account...</> : 'Create Account →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-charcoal-500 mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
