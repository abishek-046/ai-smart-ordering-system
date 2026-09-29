import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { formatCurrency, getCategoryEmoji, getCategoryLabel, getApiError } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['BREAKFAST','LUNCH','SNACKS','BEVERAGES','DESSERTS','SPECIAL'];
const EMPTY = { name:'', description:'', price:'', category:'LUNCH', prepTimeMinutes:'10', tags:'' };

export default function MenuManagement() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState({});
  const [search, setSearch] = useState('');

  const fetchMenu = () => {
    adminApi.getMenu({ search: search || undefined })
      .then(r => setItems(r.data.items))
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
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), prepTimeMinutes: parseInt(form.prepTimeMinutes), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      editId ? await adminApi.updateMenuItem(editId, payload) : await adminApi.createMenuItem(payload);
      toast.success(editId ? 'Item updated' : 'Item created');
      setShowForm(false); setEditId(null); setForm(EMPTY); fetchMenu();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await adminApi.deleteMenuItem(id); toast.success('Deleted'); fetchMenu(); }
    catch (err) { toast.error(getApiError(err)); }
  };

  const handleToggle = async (id) => {
    setToggling(p => ({ ...p, [id]: true }));
    try { await adminApi.toggleMenuItemAvailability(id); fetchMenu(); }
    catch (err) { toast.error(getApiError(err)); }
    finally { setToggling(p => ({ ...p, [id]: false })); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">Menu Management</h2>
          <p className="text-charcoal-400 text-sm font-body">{items.length} items</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY); }}
                className="btn-gold text-sm py-2 px-5">
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ border: '2px solid rgba(217,119,6,0.3)' }}>
          <h3 className="font-display font-bold text-charcoal-900 mb-5">{editId ? '✏️ Edit Item' : '➕ New Menu Item'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ghee Masala Dosa" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Category *</label>
                <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Price (₹) *</label>
                <input type="number" className="input-field" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="50" min="1" step="0.5" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Prep Time (minutes)</label>
                <input type="number" className="input-field" value={form.prepTimeMinutes} onChange={e => setForm(p => ({ ...p, prepTimeMinutes: e.target.value }))} min="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">Description</label>
              <textarea className="input-field resize-none h-20 font-body text-sm" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the dish…" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">Tags (comma-separated)</label>
              <input type="text" className="input-field" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="vegetarian, popular, spicy" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
                {saving ? <Spinner size="sm" color="white" /> : (editId ? '💾 Save Changes' : '✓ Create Item')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Search menu items…" className="input-field max-w-sm text-sm"
             value={search} onChange={e => setSearch(e.target.value)} />

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`card flex flex-col transition-opacity ${!item.isAvailable ? 'opacity-60' : ''}`}
                 style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                  <div>
                    <p className="font-display font-bold text-charcoal-900 text-sm">{item.name}</p>
                    <p className="text-xs text-charcoal-400 font-body">{getCategoryLabel(item.category).split(' ').slice(1).join(' ')}</p>
                  </div>
                </div>
                <span className={`badge ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {item.isAvailable ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-body line-clamp-2 mb-4 flex-1">{item.description}</p>
              <div className="flex items-center gap-2 text-xs text-charcoal-400 font-body mb-4">
                <span className="font-bold text-primary-700 text-sm">{formatCurrency(item.price)}</span>
                <span>· ⏱ {item.prepTimeMinutes}m</span>
                <span>· ⭐ {item.rating.toFixed(1)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="btn-secondary text-xs py-1.5 px-3 flex-1">✏️ Edit</button>
                <button onClick={() => handleToggle(item.id)} disabled={toggling[item.id]}
                        className={`text-xs py-1.5 px-3 rounded-xl font-semibold flex-1 transition-colors ${item.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {toggling[item.id] ? '…' : item.isAvailable ? '🚫 Disable' : '✅ Enable'}
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} className="btn-danger text-xs py-1.5 px-3">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
