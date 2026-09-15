import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <span className="text-3xl">🍽️</span>
          <span>SmartCanteen</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
          <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <span>🤖</span> AI-Powered College Canteen Ordering
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Skip the Queue.<br />
          <span className="text-primary-600">Order Smart.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Pre-order your canteen food, get AI-recommended pickup times, receive a digital token, and track your order in real time. No more waiting in long queues.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Start Pre-Ordering →
          </Link>
          <Link to="/menu" className="btn-secondary text-lg px-8 py-3">
            Browse Menu
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { label: 'Avg. Wait Reduced', value: '70%', icon: '⏱️' },
            { label: 'Menu Items', value: '25+', icon: '🍽️' },
            { label: 'AI Accuracy', value: '95%', icon: '🤖' },
            { label: 'Daily Orders', value: '500+', icon: '📋' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '📱', title: 'Browse & Order', desc: 'Browse the menu and add your favourite items to the cart.' },
              { step: '2', icon: '🤖', title: 'AI Pickup Time', desc: 'Our AI analyses current queue & prep time to suggest the best pickup slot.' },
              { step: '3', icon: '🎫', title: 'Get Your Token', desc: 'Receive a unique digital token as confirmation of your order.' },
              { step: '4', icon: '🔔', title: 'Track & Collect', desc: 'Track your order status live and collect when it\'s marked Ready.' },
            ].map((f) => (
              <div key={f.step} className="text-center">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{f.icon}</div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold mb-3">{f.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to skip the queue?</h2>
          <p className="text-orange-100 mb-8">Join thousands of students ordering smarter every day.</p>
          <Link to="/register" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-block text-lg">
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
