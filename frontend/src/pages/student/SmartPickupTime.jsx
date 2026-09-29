import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function SmartPickupTime() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    aiApi.getPickupSlots()
      .then((res) => {
        setData(res.data);
        // Auto-select best slot
        const best = res.data.slots?.find((s) => s.recommended);
        if (best) setSelected(best.time);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load pickup slots');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (!selected) { toast.error('Please select a pickup time'); return; }
    // Store in sessionStorage for Checkout page
    sessionStorage.setItem('pickupTime', selected);
    navigate('/checkout');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-gray-700 font-semibold mb-1">{error}</p>
        <p className="text-gray-500 text-sm">Your cart might be empty. Add items first.</p>
        <button onClick={() => navigate('/cart')} className="btn-primary mt-5">Go to Cart</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🤖 Smart Pickup Time</h1>
        <p className="text-gray-500 text-sm mt-1">AI-recommended slots based on current queue & kitchen load</p>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span className="text-gray-400">🛒 Cart</span>
          <span>→</span>
          <span className="text-primary-600 font-semibold">⏰ Pickup Time</span>
          <span>→</span>
          <span>✅ Checkout</span>
          <span>→</span>
          <span>🎫 Confirm</span>
        </div>
      </div>

      {/* AI analysis */}
      {data?.analysis && (
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔍</span>
            <h3 className="font-bold text-blue-900">AI Analysis</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xl font-bold text-blue-700">{data.analysis.currentActiveOrders}</p>
              <p className="text-xs text-gray-500 mt-0.5">Active Orders</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xl font-bold text-orange-600">{data.basePrepMinutes} min</p>
              <p className="text-xs text-gray-500 mt-0.5">Est. Prep Time</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-sm font-bold text-green-700">{data.analysis.estimatedWaitRange}</p>
              <p className="text-xs text-gray-500 mt-0.5">Wait Range</p>
            </div>
          </div>
        </div>
      )}

      {/* Slots */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-900">Select a Time Slot</h2>
        {data?.slots?.map((slot) => (
          <button
            key={slot.time}
            onClick={() => setSelected(slot.time)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              selected === slot.time ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
              selected === slot.time ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {slot.recommended ? '⭐' : '🕐'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{slot.displayTime}</span>
                {slot.recommended && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Recommended</span>}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${getLoadColor(slot.label)}`}>{slot.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                <span>⏱️ ~{slot.waitMinutes} min wait</span>
                <span>👥 {slot.currentLoad} orders</span>
              </div>
              {/* Score bar */}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${slot.score >= 85 ? 'bg-green-500' : slot.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${slot.score}%` }} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={handleContinue} className="btn-primary w-full text-base py-3">
        Continue to Checkout →
      </button>
    </div>
  );
}

function getLoadColor(label) {
  const m = { Available: 'bg-green-100 text-green-700', 'Best Pick': 'bg-blue-100 text-blue-700', Good: 'bg-blue-100 text-blue-600', Busy: 'bg-yellow-100 text-yellow-700', 'Very Busy': 'bg-red-100 text-red-700' };
  return m[label] || 'bg-gray-100 text-gray-700';
}
