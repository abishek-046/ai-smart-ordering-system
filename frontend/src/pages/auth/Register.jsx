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
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
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

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: '' })); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">🍽️ SmartCanteen</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 mt-1">Start pre-ordering in seconds</p>
        </div>

        <div className="card shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="e.g. Ravi Kumar" value={form.name} onChange={set('name')} autoFocus />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="you@college.edu" value={form.email} onChange={set('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input type="text" className="input-field" placeholder="STU-2024-001" value={form.studentId} onChange={set('studentId')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="input-field" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" className={`input-field ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input type="password" className={`input-field ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Spinner size="sm" color="white" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
