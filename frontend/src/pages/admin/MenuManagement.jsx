import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { formatCurrency, getCategoryEmoji, getCategoryLabel, getApiError } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'SPECIAL'];
const EMPTY_FORM = { name: '', description: '', price: '', category: 'LUNCH', prepTimeMinutes: '10', tags: '' };

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState({});
  const [search, setSearch] = useState('');

  const fetchMenu = () => {
    adminApi.getMenu({ search: search || undefined })
      .then((res) => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMenu(); }, [search]);

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ name: item.name, description: item.description, price: String(item.price), category: item.category, prepTimeMinutes: String(item.prepTimeMinutes), tags: item.tags?.join(', ') || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Name, price and category are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), prepTimeMinutes: parseInt(form.prepTimeMinutes), tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (editId) { await adminApi.updateMenuItem(editId, payload); toast.success('Item updated'); }
      else { await adminApi.createMenuItem(payload); toast.success('Item created'); }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM); fetchMenu();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await adminApi.deleteMenuItem(id); toast.success('Item deleted'); fetchMenu(); }
    catch (err) { toast.error(getApiError(err)); }
  };

  const handleToggle = async (id) => {
    setToggling((p) => ({ ...p, [id]: true }));
    try { await adminApi.toggleMenuItemAvailability(id); fetchMenu(); }
    catch (err) { toast.error(getApiError(err)); }
    finally { setToggling((p) => ({ ...p, [id]: false })); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Menu Management</h1><p className="text-sm text-gray-500">{items.length} items</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }} className="btn-primary text-sm px-4 py-2">
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card border-2 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? '✏️ Edit Item' : '➕ New Menu Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Masala Dosa" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input type="number" className="input-field" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="50" min="1" step="0.5" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                <input type="number" className="input-field" value={form.prepTimeMinutes} onChange={(e) => setForm((p) => ({ ...p, prepTimeMinutes: e.target.value }))} min="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field resize-none h-20" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input type="text" className="input-field" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="vegetarian, popular, spicy" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Spinner size="sm" color="white" /> : (editId ? '💾 Save Changes' : '✓ Create Item')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Search items..." className="input-field max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`card flex flex-col ${!item.isAvailable ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                </div>
                <span className={`badge ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{item.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <span className="font-bold text-primary-600">{formatCurrency(item.price)}</span>
                <span>· ⏱️ {item.prepTimeMinutes}m</span>
                <span>· ⭐ {item.rating.toFixed(1)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="btn-secondary text-xs px-3 py-1.5 flex-1">✏️ Edit</button>
                <button onClick={() => handleToggle(item.id)} disabled={toggling[item.id]} className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex-1 transition-colors ${item.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {toggling[item.id] ? '...' : (item.isAvailable ? '🚫 Disable' : '✅ Enable')}
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} className="btn-danger text-xs px-3 py-1.5">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
