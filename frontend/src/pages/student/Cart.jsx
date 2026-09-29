import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );

  if (cart.items.length === 0) return (
    <div className="max-w-md mx-auto text-center py-24 animate-fade-in">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
        style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.12)' }}
      >
        🛒
      </div>
      <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-2">Your cart is empty</h2>
      <p className="text-charcoal-500 font-body mb-8">Add some delicious dishes to get started</p>
      <Link to="/menu" className="btn-gold px-8">Browse Menu →</Link>
    </div>
  );

  const maxPrepTime = Math.max(...cart.items.map(ci => ci.foodItem?.prepTimeMinutes || 10));

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900">Your Cart</h1>
          <p className="text-charcoal-400 font-body text-sm mt-0.5">
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} · est. prep ~{maxPrepTime} min
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-600 font-semibold transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Items */}
      <div className="card space-y-0 p-0 overflow-hidden">
        {cart.items.map((ci, idx) => (
          <div key={ci.id}>
            <div className="flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                <FoodImage
                  src={ci.foodItem?.image}
                  alt={ci.foodItem?.name}
                  category={ci.foodItem?.category}
                  className="w-16 h-16"
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-charcoal-900 text-sm truncate">
                  {ci.foodItem?.name}
                </p>
                <p className="text-xs text-charcoal-400 font-body mt-0.5">
                  {formatCurrency(ci.foodItem?.price)} each · ⏱ {ci.foodItem?.prepTimeMinutes} min
                </p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-1 border border-charcoal-200 rounded-xl overflow-hidden flex-shrink-0">
                <button
                  onClick={() => updateItem(ci.foodItemId, ci.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-7 text-center font-bold text-charcoal-900 text-sm">
                  {ci.quantity}
                </span>
                <button
                  onClick={() => updateItem(ci.foodItemId, ci.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Line total + remove */}
              <div className="text-right flex-shrink-0 min-w-[64px]">
                <p className="font-bold text-sm" style={{ color: '#d97706' }}>
                  {formatCurrency((ci.foodItem?.price || 0) * ci.quantity)}
                </p>
                <button
                  onClick={() => removeItem(ci.foodItemId)}
                  className="text-xs text-red-400 hover:text-red-600 mt-0.5 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
            {idx < cart.items.length - 1 && (
              <div className="h-px bg-charcoal-50 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-4">Order Summary</h2>
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-sm font-body text-charcoal-600">
            <span>Subtotal ({cart.totalItems} items)</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          <div className="flex justify-between text-sm font-body text-charcoal-600">
            <span>Preparation fee</span>
            <span className="text-green-600 font-semibold">Free</span>
          </div>
          <div className="flex justify-between text-sm font-body text-charcoal-600">
            <span>Payment</span>
            <span className="text-charcoal-500">At counter (cash / UPI)</span>
          </div>
          <div className="h-px bg-charcoal-100 my-1" />
          <div className="flex justify-between font-display font-bold text-charcoal-900 text-lg">
            <span>Total</span>
            <span style={{ color: '#d97706' }}>{formatCurrency(cart.total)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/pickup-time')}
          className="btn-gold w-full py-3.5 text-base"
        >
          ⏰ Select Pickup Time →
        </button>
        <Link
          to="/menu"
          className="btn-secondary w-full text-center mt-3 block text-sm"
        >
          + Add More Items
        </Link>
      </div>

      {/* Info strip */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3 text-sm font-body text-charcoal-600"
        style={{ background: '#fdf8f0', border: '1px solid rgba(217,119,6,0.1)' }}
      >
        <span className="text-xl flex-shrink-0">ℹ️</span>
        <span>
          After selecting a pickup time, you'll confirm your order on the next screen.
          No payment is taken online — pay at the canteen counter.
        </span>
      </div>
    </div>
  );
}
