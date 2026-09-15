import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious food to get started</p>
        <Link to="/menu" className="btn-primary inline-block">Browse Menu →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🛒 Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear all</button>
      </div>

      <div className="card space-y-4">
        {cart.items.map((ci) => (
          <div key={ci.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
              {getCategoryEmoji(ci.foodItem.category)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{ci.foodItem.name}</p>
              <p className="text-xs text-gray-500">{formatCurrency(ci.foodItem.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateItem(ci.foodItemId, ci.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors">−</button>
              <span className="w-6 text-center font-bold text-gray-900 text-sm">{ci.quantity}</span>
              <button onClick={() => updateItem(ci.foodItemId, ci.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors">+</button>
            </div>
            <div className="text-right min-w-[60px]">
              <p className="font-bold text-primary-600 text-sm">{formatCurrency(ci.foodItem.price * ci.quantity)}</p>
              <button onClick={() => removeItem(ci.foodItemId)} className="text-xs text-red-400 hover:text-red-600 mt-0.5">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({cart.totalItems} items)</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Preparation</span>
            <span className="text-green-600">Included</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(cart.total)}</span>
          </div>
        </div>
        <button onClick={() => navigate('/pickup-time')} className="btn-primary w-full text-base py-3">
          Select Pickup Time →
        </button>
        <Link to="/menu" className="btn-secondary w-full text-center mt-2 block text-sm">Continue Shopping</Link>
      </div>
    </div>
  );
}
