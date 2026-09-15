import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmNew) { setPwError('Passwords do not match'); return; }

    setChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setPwError(getApiError(err));
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">👤 Profile & Settings</h1>

      {/* Avatar */}
      <div className="card text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700 mx-auto mb-3">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>
        {user?.studentId && <p className="text-xs text-gray-400 mt-0.5">Student ID: {user.studentId}</p>}
        <span className="mt-2 badge bg-primary-100 text-primary-700 inline-block">{user?.role}</span>
      </div>

      {/* Edit profile */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Edit Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field bg-gray-50" value={user?.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Spinner size="sm" color="white" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{pwError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" className="input-field" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="input-field" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" className="input-field" value={pwForm.confirmNew} onChange={(e) => setPwForm((p) => ({ ...p, confirmNew: e.target.value }))} />
          </div>
          <button type="submit" disabled={changingPw} className="btn-secondary flex items-center gap-2">
            {changingPw ? <><Spinner size="sm" /> Changing...</> : '🔒 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
