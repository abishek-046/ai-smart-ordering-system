import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getCategoryEmoji, getCategoryLabel } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    menuApi.getById(id)
      .then((res) => setItem(res.data.item))
      .catch(() => navigate('/menu'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(item.id, qty); } finally { setAdding(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!item) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">← Back</button>
      <div className="card">
        <div className={`h-56 rounded-xl mb-6 flex items-center justify-center text-8xl bg-gradient-to-br from-orange-100 to-amber-50`}>
          {getCategoryEmoji(item.category)}
        </div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          <span className="text-2xl font-bold text-primary-600">{formatCurrency(item.price)}</span>
        </div>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge bg-orange-100 text-orange-700">{getCategoryLabel(item.category)}</span>
          {item.tags?.map((tag) => (
            <span key={tag} className="badge bg-gray-100 text-gray-600">{tag}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6 text-center">
          <div><p className="text-sm text-gray-500">Prep Time</p><p className="font-bold text-gray-900">{item.prepTimeMinutes} min</p></div>
          <div><p className="text-sm text-gray-500">Rating</p><p className="font-bold text-gray-900">⭐ {item.rating.toFixed(1)}</p></div>
          <div><p className="text-sm text-gray-500">Reviews</p><p className="font-bold text-gray-900">{item.totalRatings}</p></div>
        </div>
        {item.isAvailable ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 font-bold text-gray-700">−</button>
              <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 font-bold text-gray-700">+</button>
            </div>
            <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {adding ? <Spinner size="sm" color="white" /> : `Add ${qty} to Cart · ${formatCurrency(item.price * qty)}`}
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center font-medium">
            ❌ This item is currently unavailable
          </div>
        )}
      </div>
    </div>
  );
}
