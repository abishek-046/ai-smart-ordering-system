import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const LOAD_STYLE = {
  Available: { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#16a34a' },
  'Best Pick':{ bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#2563eb' },
  Good:       { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)',  text: '#d97706' },
  Busy:       { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.3)',  text: '#ca8a04' },
  'Very Busy':{ bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#dc2626' },
};

export default function SmartPickupTime() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    aiApi.getPickupSlots()
      .then(r => {
        setData(r.data);
        const best = r.data.slots?.find(s => s.recommended);
        if (best) setSelected(best.time);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load pickup slots'))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (!selected) { toast.error('Please select a pickup time'); return; }
    sessionStorage.setItem('pickupTime', selected);
    navigate('/checkout');
  };

  if (loading) return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;

  if (error) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="font-display text-xl font-bold text-charcoal-900 mb-2">Couldn't load slots</h2>
      <p className="text-charcoal-500 font-body mb-2">{error}</p>
      <p className="text-charcoal-400 text-sm font-body mb-6">Make sure your cart has items first.</p>
      <button onClick={() => navigate('/cart')} className="btn-primary">← Back to Cart</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Smart Pickup Time</h1>
        <p className="text-charcoal-500 font-body text-sm mt-1">AI-recommended slots based on live kitchen load</p>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          {['🛒 Cart', '⏰ Pickup Time', '✅ Checkout', '🎫 Confirm'].map((s, i) => (
            <span key={s} className={`flex items-center gap-1 ${i === 1 ? 'font-bold text-primary-700' : 'text-charcoal-400'}`}>
              {i > 0 && <span className="text-charcoal-200">›</span>}
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* AI analysis card */}
      {data?.analysis && (
        <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.08),rgba(245,158,11,0.04))', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                 style={{ background: 'rgba(217,119,6,0.15)' }}>🤖</div>
            <div>
              <p className="font-display font-bold text-charcoal-900">AI Analysis</p>
              <p className="text-xs text-charcoal-500 font-body">Based on live order data</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active Orders', value: data.analysis.currentActiveOrders },
              { label: 'Est. Prep', value: `${data.basePrepMinutes} min` },
              { label: 'Wait Range', value: data.analysis.estimatedWaitRange },
            ].map(s => (
              <div key={s.label} className="bg-white/60 rounded-2xl p-3 text-center">
                <p className="font-display font-bold text-base text-charcoal-900">{s.value}</p>
                <p className="text-xs text-charcoal-400 font-body mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slots */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-charcoal-900 text-lg">Choose a Time Slot</h2>
        {data?.slots?.map(slot => {
          const isSelected = selected === slot.time;
          const style = LOAD_STYLE[slot.label] || LOAD_STYLE.Available;
          return (
            <button key={slot.time} onClick={() => setSelected(slot.time)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: isSelected ? '#d97706' : 'rgba(0,0,0,0.08)',
                      background: isSelected ? 'rgba(217,119,6,0.06)' : 'white',
                      boxShadow: isSelected ? '0 0 0 1px rgba(217,119,6,0.3)' : 'none',
                    }}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                   style={{ background: isSelected ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'rgba(0,0,0,0.04)' }}>
                {slot.recommended ? <span style={{ filter: isSelected ? 'brightness(10)' : 'none' }}>⭐</span> : '🕐'}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-charcoal-900">{slot.displayTime}</span>
                  {slot.recommended && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>
                      Recommended
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full ml-auto"
                        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                    {slot.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400 font-body">
                  <span>⏱ ~{slot.waitMinutes} min wait</span>
                  <span>·</span>
                  <span>👥 {slot.currentLoad} orders</span>
                </div>
                {/* Score bar */}
                <div className="mt-2 h-1 bg-charcoal-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${slot.score}%`, background: slot.score >= 80 ? '#22c55e' : slot.score >= 60 ? '#d97706' : '#ef4444' }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={handleContinue}
              className="btn-gold w-full py-4 text-base">
        Continue to Checkout →
      </button>
    </div>
  );
}
