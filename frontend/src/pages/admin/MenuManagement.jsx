import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { formatCurrency, getCategoryLabel, getApiError } from '../../utils/helpers';
import FoodImage from '../../components/ui/FoodImage';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];
const EMPTY = { name: '', description: '', price: '', category: 'LUNCH', prepTimeMinutes: '10', image: '', tags: '' };

export default function MenuManagement() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState({});
  const [search, setSearch]     = useState('');

  const fetchMenu = useCallback(() => {
    adminApi.getMenu({ search: search || undefined })
      .then(r => setItems(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchMenu, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMenu, search]);

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      prepTimeMinutes: String(item.prepTimeMinutes),
      image: item.image || '',
      tags: item.tags?.join(', ') || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      toast.error('Enter a valid positive price'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        prepTimeMinutes: parseInt(form.prepTimeMinutes) || 10,
        image: form.image.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editId) {
        await adminApi.updateMenuItem(editId, payload);
        toast.success('Item updated');
      } else {
        await adminApi.createMenuItem(payload);
        toast.success('Item created');
      }
      closeForm();
      fetchMenu();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteMenuItem(id);
      toast.success('Item deleted');
      fetchMenu();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleToggle = async (id) => {
    setToggling(p => ({ ...p, [id]: true }));
    try {
      await adminApi.toggleMenuItemAvailability(id);
      fetchMenu();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setToggling(p => ({ ...p, [id]: false }));
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Menu Management</h2>
          <p className="text-charcoal-400 font-body text-sm">{items.length} items</p>
        </div>
        <button
          onClick={() => { if (showForm) closeForm(); else setShowForm(true); }}
          className={showForm ? 'btn-secondary text-sm py-2 px-4' : 'btn-gold text-sm py-2 px-5'}
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div
          className="card"
          style={{ border: '2px solid rgba(217,119,6,0.3)' }}
        >
          <h3 className="font-display font-bold text-charcoal-900 mb-5">
            {editId ? '✏️ Edit Item' : '➕ New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">Name *</label>
                <input
                  type="text" className="input-field" value={form.name}
                  onChange={set('name')} placeholder="e.g. Ghee Masala Dosa" required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">Category *</label>
                <select className="input-field" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{getCategoryLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">Price (₹) *</label>
                <input
                  type="number" className="input-field" value={form.price}
                  onChange={set('price')} placeholder="50" min="1" step="0.5" required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">Prep Time (minutes)</label>
                <input
                  type="number" className="input-field" value={form.prepTimeMinutes}
                  onChange={set('prepTimeMinutes')} min="1" max="120"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">Description</label>
              <textarea
                className="input-field resize-none h-20 font-body text-sm"
                value={form.description} onChange={set('description')}
                placeholder="Describe the dish — ingredients, style, serving…"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">
                Photo URL
                <span className="font-normal text-charcoal-400 ml-1">(Unsplash or any direct image URL)</span>
              </label>
              <input
                type="url" className="input-field text-sm" value={form.image}
                onChange={set('image')} placeholder="https://images.unsplash.com/photo-…"
              />
              {form.image && (
                <div className="mt-2 h-20 w-32 rounded-xl overflow-hidden border border-charcoal-100">
                  <FoodImage src={form.image} alt="preview" category={form.category} className="h-full" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">
                Tags
                <span className="font-normal text-charcoal-400 ml-1">(comma-separated)</span>
              </label>
              <input
                type="text" className="input-field text-sm" value={form.tags}
                onChange={set('tags')} placeholder="vegetarian, popular, spicy"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
                {saving
                  ? <><Spinner size="sm" color="white" />Saving…</>
                  : editId ? '💾 Save Changes' : '✓ Create Item'}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text" className="input-field pl-10 text-sm" value={search}
          onChange={e => setSearch(e.target.value)} placeholder="Search menu items…"
        />
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-display font-bold text-charcoal-700">No items found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`card flex flex-col overflow-hidden p-0 transition-opacity ${!item.isAvailable ? 'opacity-60' : ''}`}
              style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {/* Photo */}
              <div className="h-36 relative overflow-hidden rounded-t-3xl">
                <FoodImage
                  src={item.image}
                  alt={item.name}
                  category={item.category}
                  className="h-full"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {item.isAvailable ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-1">
                  <p className="font-display font-bold text-charcoal-900 text-sm leading-tight line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-charcoal-400 font-body mt-0.5">
                    {getCategoryLabel(item.category).replace(/^[^\s]+\s/, '')}
                  </p>
                </div>
                <p className="text-xs text-charcoal-500 font-body line-clamp-2 mb-3 flex-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-body text-charcoal-400 mb-3">
                  <span className="font-bold text-primary-700 text-sm">{formatCurrency(item.price)}</span>
                  <span className="text-charcoal-200">·</span>
                  <span>⏱ {item.prepTimeMinutes}m</span>
                  {item.totalRatings > 0 && (
                    <>
                      <span className="text-charcoal-200">·</span>
                      <span className="text-amber-500">★ {item.rating.toFixed(1)}</span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="btn-secondary text-xs py-1.5 px-3 flex-1"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggle(item.id)}
                    disabled={toggling[item.id]}
                    className={`text-xs py-1.5 px-3 rounded-xl font-semibold flex-1 transition-colors ${
                      item.isAvailable
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {toggling[item.id] ? '…' : item.isAvailable ? '🚫 Disable' : '✅ Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="btn-danger text-xs py-1.5 px-3"
                    aria-label={`Delete ${item.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
