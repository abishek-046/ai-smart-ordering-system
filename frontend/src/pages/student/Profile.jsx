import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pw, setPw]     = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [saving, setSaving]   = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pw.newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (pw.newPassword !== pw.confirmNew) { setPwError('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) { setPwError(getApiError(err)); }
    finally { setChangingPw(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Profile & Settings</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">Manage your account</p>
      </div>

      {/* Avatar card */}
      <div className="card text-center py-8"
           style={{ background: 'linear-gradient(135deg,#0f0a06,#1e1208)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4"
             style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="font-display text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">{user?.email}</p>
        {user?.studentId && <p className="text-amber-400 text-xs font-body mt-1">{user.studentId}</p>}
        <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          {user?.role}
        </span>
      </div>

      {/* Edit profile */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-5">Edit Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">Full Name</label>
            <input type="text" className="input-field" value={form.name}
                   onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">Email</label>
            <input type="email" className="input-field" value={user?.email} disabled
                   style={{ background: '#f5f2ed', color: '#9d8d74' }} />
            <p className="text-xs text-charcoal-400 font-body mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">Phone</label>
            <input type="tel" className="input-field" value={form.phone} placeholder="10-digit mobile number"
                   onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
            {saving ? <><Spinner size="sm" color="white" /> Saving…</> : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-display font-bold text-charcoal-900 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 font-body">{pwError}</div>
          )}
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">Current Password</label>
            <input type="password" className="input-field" value={pw.currentPassword}
                   onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">New Password</label>
            <input type="password" className="input-field" value={pw.newPassword} placeholder="Min. 6 characters"
                   onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal-700 mb-2">Confirm New Password</label>
            <input type="password" className="input-field" value={pw.confirmNew}
                   onChange={e => setPw(p => ({ ...p, confirmNew: e.target.value }))} />
          </div>
          <button type="submit" disabled={changingPw} className="btn-secondary flex items-center gap-2">
            {changingPw ? <><Spinner size="sm" /> Changing…</> : '🔒 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
