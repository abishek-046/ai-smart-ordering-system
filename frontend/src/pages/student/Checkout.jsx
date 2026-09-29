import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../services/api';
import { formatCurrency, formatTime } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

function StepIndicator({ current }) {
  const steps = ['🛒 Cart', '⏰ Pickup Time', '✅ Checkout', '🎫 Confirm'];
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap">
      {steps.map((s, i) => (
        <span key={s} className={`flex items-center gap-1 ${i === current ? 'font-bold text-primary-700' : 'text-charcoal-400'}`}>
          {i > 0 && <span className="text-charcoal-200 mx-0.5">›</span>}
          {s}
        </span>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [pickupTime, setPickupTime]           = useState('');
  const [specialInstructions, setSpecial]     = useState('');
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pickupTime');
    if (stored) {
      setPickupTime(stored);
    } else if (!cart.loading && cart.items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [navigate, cart.loading, cart.items.length]);

  const handlePlaceOrder = async () => {
    if (!pickupTime) { toast.error('Please select a pickup time first'); navigate('/pickup-time'); return; }
    if (cart.items.length === 0) { toast.error('Your cart is empty'); navigate('/cart'); return; }

    setLoading(true);
    try {
      const res = await orderApi.create({
        pickupTime,
        specialInstructions: specialInstructions.trim() || undefined,
      });
      sessionStorage.removeItem('pickupTime');
      await refreshCart();
      toast.success('Order placed! 🎉');
      navigate(`/order-confirmation/${res.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.loading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );
  if (cart.items.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Checkout</h1>
        <p className="text-charcoal-400 font-body text-sm mt-0.5">Review your order before confirming</p>
        <div className="mt-3"><StepIndicator current={2} /></div>
      </div>

      {/* Order items */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.items.map((ci, idx) => (
            <div key={ci.id}>
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <FoodImage
                    src={ci.foodItem.image}
                    alt={ci.foodItem.name}
                    category={ci.foodItem.category}
                    className="w-14 h-14"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal-900 text-sm font-body truncate">
                    {ci.foodItem.name}
                  </p>
                  <p className="text-xs text-charcoal-400 font-body">
                    {formatCurrency(ci.foodItem.price)} × {ci.quantity}
                  </p>
                </div>
                <span className="font-bold text-charcoal-900 text-sm flex-shrink-0">
                  {formatCurrency(ci.foodItem.price * ci.quantity)}
                </span>
              </div>
              {idx < cart.items.length - 1 && (
                <div className="h-px bg-charcoal-50 mt-4" />
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-charcoal-100 space-y-2">
          <div className="flex justify-between text-sm font-body text-charcoal-600">
            <span>Subtotal ({cart.totalItems} items)</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          <div className="flex justify-between text-sm font-body text-charcoal-600">
            <span>Preparation</span>
            <span className="text-green-600 font-semibold">Included</span>
          </div>
          <div className="flex justify-between font-display font-bold text-charcoal-900 text-lg pt-1 border-t border-charcoal-100">
            <span>Total</span>
            <span style={{ color: '#d97706' }}>{formatCurrency(cart.total)}</span>
          </div>
        </div>
      </div>

      {/* Pickup time */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-3">Pickup Details</h2>
        {pickupTime ? (
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div>
              <p className="text-xs font-semibold text-green-700 font-body mb-0.5">Scheduled Pickup</p>
              <p className="font-display text-xl font-bold text-charcoal-900">{formatTime(pickupTime)}</p>
            </div>
            <button
              onClick={() => navigate('/pickup-time')}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/pickup-time')} className="btn-secondary w-full">
            ⏰ Select Pickup Time
          </button>
        )}
      </div>

      {/* Special instructions */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-1">
          Special Instructions
          <span className="font-sans font-normal text-sm text-charcoal-400 ml-2">(optional)</span>
        </h2>
        <p className="text-xs text-charcoal-400 font-body mb-3">
          Allergies, spice level, packaging preferences…
        </p>
        <textarea
          className="input-field resize-none h-20 font-body text-sm"
          placeholder="e.g. Less spicy, no onions, extra chutney…"
          value={specialInstructions}
          onChange={e => setSpecial(e.target.value)}
          maxLength={300}
        />
        {specialInstructions && (
          <p className="text-xs text-charcoal-400 text-right font-body mt-1">
            {specialInstructions.length}/300
          </p>
        )}
      </div>

      {/* Payment note */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)' }}
      >
        <span className="text-xl flex-shrink-0">💳</span>
        <div>
          <p className="font-semibold text-charcoal-800 text-sm font-body">Pay at Counter</p>
          <p className="text-charcoal-500 text-xs font-body mt-0.5">
            Cash or UPI accepted when you collect. Show your digital token to the staff.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || !pickupTime}
        className="btn-gold w-full py-4 text-base"
      >
        {loading ? (
          <><Spinner size="sm" color="white" /> Placing Order…</>
        ) : (
          `Place Order · ${formatCurrency(cart.total)}`
        )}
      </button>

      {!pickupTime && (
        <p className="text-center text-xs text-charcoal-400 font-body -mt-3">
          You need to select a pickup time to continue
        </p>
      )}
    </div>
  );
}
