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
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">✅ Checkout</h1>

      {/* Order items */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cart.items.map((ci) => (
            <div key={ci.id} className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryEmoji(ci.foodItem.category)}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{ci.foodItem.name} × {ci.quantity}</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(ci.foodItem.price * ci.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(cart.total)}</span>
          </div>
        </div>
      </div>

      {/* Pickup time */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">📍 Pickup Details</h2>
        {pickupTime ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
            <div>
              <p className="text-sm text-green-700 font-semibold">Pickup Time</p>
              <p className="text-lg font-bold text-gray-900">{formatTime(pickupTime)}</p>
            </div>
            <button onClick={() => navigate('/pickup-time')} className="text-sm text-primary-600 font-semibold hover:underline">Change</button>
          </div>
        ) : (
          <button onClick={() => navigate('/pickup-time')} className="btn-secondary w-full">Select Pickup Time</button>
        )}
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">📝 Special Instructions (optional)</h2>
        <textarea
          className="input-field resize-none h-20"
          placeholder="e.g. Less spicy, no onions, extra sauce..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
        />
      </div>

      {/* Payment note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-0.5">💳 Payment at Counter</p>
        <p>Pay when you collect your order at the canteen counter. Show your digital token.</p>
      </div>

      {/* Place Order */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || !pickupTime}
        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
      >
        {loading ? <><Spinner size="sm" color="white" /> Placing Order...</> : `Place Order · ${formatCurrency(cart.total)}`}
      </button>
    </div>
  );
}
