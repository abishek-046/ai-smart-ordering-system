import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

function Section({ title, children }) {
  return (
    <div className="card">
      <h2 className="font-display font-bold text-charcoal-900 text-lg mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-charcoal-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-charcoal-400 font-body mt-1">{hint}</p>}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser }  = useAuth();
  const [form, setForm]       = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pw, setPw]           = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pw.current)          { setPwError('Current password is required'); return; }
    if (pw.next.length < 6)   { setPwError('New password must be at least 6 characters'); return; }
    if (pw.next !== pw.confirm){ setPwError('Passwords do not match'); return; }

    setChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      toast.success('Password changed successfully');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(getApiError(err));
    } finally {
      setChangingPw(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">Profile & Settings</h1>
        <p className="text-charcoal-400 font-body text-sm mt-0.5">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <div
        className="rounded-3xl p-7 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f0a06,#1e1208)', border: '1px solid rgba(245,158,11,0.18)' }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#f59e0b,transparent)' }}
        />
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}
        >
          {initials}
        </div>
        <h2 className="font-display text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">{user?.email}</p>
        {user?.studentId && (
          <p
            className="text-sm font-body mt-1"
            style={{ color: 'rgba(245,158,11,0.7)' }}
          >
            {user.studentId}
          </p>
        )}
        <span
          className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
        >
          {user?.role}
        </span>
      </div>

      {/* Edit profile */}
      <Section title="Edit Profile">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Field label="Full Name">
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </Field>
          <Field label="Email Address" hint="Email cannot be changed">
            <input
              type="email"
              className="input-field"
              value={user?.email}
              disabled
              style={{ background: '#f5f2ed', color: '#9d8d74', cursor: 'not-allowed' }}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="10-digit mobile number"
            />
          </Field>
          <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
            {saving ? <><Spinner size="sm" color="white" />Saving…</> : '💾 Save Changes'}
          </button>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 font-body">
              {pwError}
            </div>
          )}
          <Field label="Current Password">
            <input
              type="password"
              className="input-field"
              value={pw.current}
              onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </Field>
          <Field label="New Password" hint="Minimum 6 characters">
            <input
              type="password"
              className="input-field"
              value={pw.next}
              onChange={e => { setPw(p => ({ ...p, next: e.target.value })); setPwError(''); }}
              placeholder="New password"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              className={`input-field ${pw.confirm && pw.next !== pw.confirm ? 'border-red-300' : ''}`}
              value={pw.confirm}
              onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError(''); }}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            {pw.confirm && pw.next !== pw.confirm && (
              <p className="text-xs text-red-500 font-body mt-1">Passwords do not match</p>
            )}
          </Field>
          <button
            type="submit"
            disabled={changingPw || (pw.confirm && pw.next !== pw.confirm)}
            className="btn-secondary flex items-center gap-2"
          >
            {changingPw ? <><Spinner size="sm" />Changing…</> : '🔒 Change Password'}
          </button>
        </form>
      </Section>

      {/* Account info (read-only) */}
      <Section title="Account Information">
        <div className="space-y-3">
          {[
            { label: 'Account Type', value: user?.role || '—' },
            { label: 'Student ID',   value: user?.studentId || 'Not set' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
          ].map(row => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 border-b border-charcoal-50 last:border-0"
            >
              <span className="text-sm text-charcoal-500 font-body">{row.label}</span>
              <span className="text-sm font-semibold text-charcoal-900">{row.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
