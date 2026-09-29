import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../services/api';
import { formatCurrency, formatTime, getCategoryEmoji } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pickupTime');
    if (stored) setPickupTime(stored);
    else if (cart.items.length === 0) navigate('/cart');
  }, [navigate, cart.items.length]);

  const handlePlaceOrder = async () => {
    if (!pickupTime) { toast.error('Please select a pickup time first'); navigate('/pickup-time'); return; }
    if (cart.items.length === 0) { toast.error('Cart is empty'); navigate('/cart'); return; }
    setLoading(true);
    try {
      const res = await orderApi.create({ pickupTime, specialInstructions: specialInstructions || undefined });
      sessionStorage.removeItem('pickupTime');
      await refreshCart();
      toast.success('Order placed! 🎉');
      navigate(`/order-confirmation/${res.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Checkout</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">Review your order before placing</p>
      </div>

      {/* Order items */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cart.items.map((ci, idx) => (
            <div key={ci.id}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryEmoji(ci.foodItem.category)}</span>
                <span className="flex-1 text-sm font-semibold text-charcoal-800 font-body">
                  {ci.foodItem.name} × {ci.quantity}
                </span>
                <span className="font-bold text-charcoal-900 text-sm">
                  {formatCurrency(ci.foodItem.price * ci.quantity)}
                </span>
              </div>
              {idx < cart.items.length - 1 && <div className="h-px bg-charcoal-50 mt-3" />}
            </div>
          ))}
          <div className="h-px bg-charcoal-100" />
          <div className="flex justify-between font-display font-bold text-charcoal-900 text-lg">
            <span>Total</span>
            <span style={{ color: '#d97706' }}>{formatCurrency(cart.total)}</span>
          </div>
        </div>
      </div>

      {/* Pickup time */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-4">📍 Pickup Details</h2>
        {pickupTime ? (
          <div className="flex items-center justify-between p-4 rounded-2xl"
               style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div>
              <p className="text-xs font-semibold text-green-700 font-body mb-0.5">Scheduled Pickup</p>
              <p className="font-display text-xl font-bold text-charcoal-900">{formatTime(pickupTime)}</p>
            </div>
            <button onClick={() => navigate('/pickup-time')}
                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Change
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/pickup-time')} className="btn-secondary w-full">
            Select Pickup Time
          </button>
        )}
      </div>

      {/* Special instructions */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-3">📝 Special Instructions
          <span className="font-sans font-normal text-sm text-charcoal-400 ml-2">(optional)</span>
        </h2>
        <textarea
          className="input-field resize-none h-20 font-body text-sm"
          placeholder="e.g. Less spicy, no onions, extra sauce, pack separately…"
          value={specialInstructions}
          onChange={e => setSpecialInstructions(e.target.value)}
        />
      </div>

      {/* Payment note */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
           style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)' }}>
        <span className="text-xl flex-shrink-0">💳</span>
        <div>
          <p className="font-semibold text-charcoal-800 text-sm">Payment at Counter</p>
          <p className="text-charcoal-500 text-xs font-body mt-0.5">
            Pay when you collect — cash or UPI accepted. Show your digital token at the counter.
          </p>
        </div>
      </div>

      {/* Place order */}
      <button onClick={handlePlaceOrder} disabled={loading || !pickupTime}
              className="btn-gold w-full py-4 text-base">
        {loading
          ? <><Spinner size="sm" color="white" /> Placing Order…</>
          : `Place Order · ${formatCurrency(cart.total)}`}
      </button>
    </div>
  );
}
