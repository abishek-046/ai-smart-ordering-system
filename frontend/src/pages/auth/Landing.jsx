import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const DISHES = [
  { emoji: '🍛', name: 'Chicken Biryani', price: '₹130' },
  { emoji: '🥞', name: 'Ghee Masala Dosa', price: '₹55' },
  { emoji: '🍜', name: 'Cheesy Maggi', price: '₹40' },
  { emoji: '🫕', name: 'Veg Thali', price: '₹90' },
  { emoji: '☕', name: 'Filter Coffee', price: '₹20' },
  { emoji: '🍩', name: 'Gulab Jamun', price: '₹35' },
];

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;

  return (
    <div className="min-h-screen bg-ivory font-sans">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-charcoal-100/60"
           style={{ background: 'rgba(253,248,240,0.92)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
              🍽️
            </div>
            <div>
              <p className="font-display font-bold text-charcoal-900 leading-none text-lg">SmartCanteen</p>
              <p className="text-xs text-charcoal-400 leading-none mt-0.5">AI-Powered Ordering</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-5">Sign In</Link>
            <Link to="/register" className="btn-gold text-sm py-2 px-5">Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero-bg min-h-screen flex items-center pt-20 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-32 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }} />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-8 blur-3xl"
             style={{ background: 'radial-gradient(circle,#d97706,transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
                   style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                AI-Powered • Zero Queues • Live Tracking
              </div>

              <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">Skip the</span>
                <br />
                <span className="text-gold-shimmer">Queue.</span>
                <br />
                <span className="text-white">Eat Better.</span>
              </h1>

              <p className="text-charcoal-300 text-lg leading-relaxed mb-8 max-w-lg font-body">
                Pre-order your canteen food from class, get an AI-predicted pickup time, receive a digital token, and track your order live. No more waiting in line.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/register" className="btn-gold text-base px-8 py-3.5">
                  Start Pre-Ordering Free →
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white transition-colors font-semibold py-3.5 px-4">
                  Sign in <span>↗</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 text-sm text-charcoal-400">
                {[
                  { icon: '🔒', text: 'Secure JWT Auth' },
                  { icon: '🤖', text: 'Real AI Engine' },
                  { icon: '⚡', text: 'Live Order Tracking' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-1.5">
                    <span>{b.icon}</span>
                    <span className="font-medium">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating dish cards */}
            <div className="relative h-96 lg:h-[520px] hidden lg:block">
              {/* Central glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full opacity-20 blur-2xl"
                     style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }} />
              </div>
              {/* Orbiting dish cards */}
              {DISHES.map((dish, i) => {
                const angle = (i / DISHES.length) * 2 * Math.PI;
                const rx = 200, ry = 170;
                const cx = 50 + (rx * Math.cos(angle)) / 4.5;
                const cy = 50 + (ry * Math.sin(angle)) / 4.5;
                return (
                  <div key={dish.name}
                       className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float"
                       style={{ left: `${cx}%`, top: `${cy}%`, animationDelay: `${i * 0.5}s` }}>
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 whitespace-nowrap"
                         style={{ background: 'rgba(30,22,16,0.85)', border: '1px solid rgba(245,158,11,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                      <span className="text-2xl">{dish.emoji}</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{dish.name}</p>
                        <p className="text-amber-400 text-xs font-bold">{dish.price}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Center badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-3xl p-6 text-center"
                     style={{ background: 'rgba(30,22,16,0.9)', border: '1px solid rgba(245,158,11,0.35)', backdropFilter: 'blur(20px)' }}>
                  <div className="text-5xl mb-2">🍽️</div>
                  <p className="text-white font-display font-bold text-sm">SmartCanteen</p>
                  <p className="text-amber-400 text-xs mt-1">33 Authentic Dishes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {[
              { value: '500+', label: 'Daily Orders', icon: '📋' },
              { value: '70%',  label: 'Wait Time Reduced', icon: '⏱️' },
              { value: '33',   label: 'Authentic Dishes', icon: '🍽️' },
              { value: '4.8★', label: 'Student Rating', icon: '⭐' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 text-center"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                <p className="text-charcoal-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="font-display text-4xl font-bold text-charcoal-900 mb-4">How It Works</h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: '📱', title: 'Browse & Add', desc: 'Explore 33 authentic dishes. Add your favourites to the cart from anywhere on campus.' },
              { step: '02', icon: '🤖', title: 'AI Pickup Time', desc: 'Our AI analyses live queue data & kitchen load to suggest your optimal pickup slot.' },
              { step: '03', icon: '🎫', title: 'Digital Token', desc: 'Receive a unique token like ORD-0915-4821 as your order confirmation.' },
              { step: '04', icon: '🔔', title: 'Track Live', desc: 'Watch your order move from Accepted → Preparing → Ready in real time.' },
            ].map((s, i) => (
              <div key={s.step} className="group relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0"
                       style={{ background: 'linear-gradient(90deg,#d97706,transparent)', marginLeft: '-8px' }} />
                )}
                <div className="relative z-10 bg-ivory rounded-3xl p-7 text-center border border-charcoal-100 group-hover:border-primary-200 transition-all duration-300 group-hover:shadow-card-hover">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                       style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.12),rgba(245,158,11,0.06))' }}>
                    {s.icon}
                  </div>
                  <p className="font-display font-bold text-4xl text-primary-200 mb-2">{s.step}</p>
                  <h3 className="font-display font-bold text-charcoal-900 text-lg mb-3">{s.title}</h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed font-body">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Dishes ─────────────────────────────────── */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">From Our Kitchen</p>
            <h2 className="font-display text-4xl font-bold text-charcoal-900 mb-4">Fan Favourites</h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🍛', name: 'Chicken Biryani', cat: 'Lunch', price: '₹130', rating: '4.9', tag: 'Bestseller' },
              { emoji: '🥞', name: 'Ghee Masala Dosa', cat: 'Breakfast', price: '₹55', rating: '4.8', tag: 'Most Loved' },
              { emoji: '☕', name: 'Kadak Masala Chai', cat: 'Beverages', price: '₹15', rating: '4.8', tag: '800+ Reviews' },
              { emoji: '🍜', name: 'Cheesy Maggi', cat: 'Snacks', price: '₹40', rating: '4.5', tag: '500+ Orders' },
              { emoji: '🫕', name: 'Veg Thali (Full)', cat: 'Lunch', price: '₹90', rating: '4.7', tag: 'Complete Meal' },
              { emoji: '🍩', name: 'Gulab Jamun', cat: 'Desserts', price: '₹35', rating: '4.8', tag: 'Must Try' },
            ].map(d => (
              <div key={d.name} className="food-card group">
                <div className="h-44 flex items-center justify-center text-7xl relative overflow-hidden"
                     style={{ background: 'linear-gradient(135deg,#fef9f0,#fef3c7)' }}>
                  <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{d.emoji}</span>
                  <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: 'white' }}>
                    {d.tag}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display font-bold text-charcoal-900 text-lg">{d.name}</h3>
                    <span className="font-bold text-primary-600 text-lg">{d.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-400">
                    <span>{d.cat}</span>
                    <span>·</span>
                    <span className="text-amber-500 font-semibold">⭐ {d.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
              View All 33 Dishes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="hero-bg py-24 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[600px] h-[600px] rounded-full"
               style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to eat<br />
            <span className="text-gold-shimmer">without waiting?</span>
          </h2>
          <p className="text-charcoal-300 mb-10 text-lg font-body">
            Join 500+ students who pre-order every day. Free to sign up. No app download needed.
          </p>
          <Link to="/register"
                className="inline-flex items-center gap-2 text-charcoal-900 font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', boxShadow: '0 8px 32px rgba(245,158,11,0.45)' }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-950 py-8 text-center">
        <p className="text-charcoal-500 text-sm font-body">
          © 2026 SmartCanteen · AI-Smart Ordering System · Built with ❤️ for college students
        </p>
      </footer>
    </div>
  );
}
