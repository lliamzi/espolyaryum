'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthProvider';
import { supabase, usernameToEmail } from '../../lib/supabase';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (profile) setUsername(profile.username);
  }, [loading, user, profile, router]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    // Update password / synthetic email if the username changed
    const updates = {};
    if (password) updates.password = password;
    if (username !== profile.username) updates.email = usernameToEmail(username);

    if (Object.keys(updates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) {
        setError(authError.message);
        setSaving(false);
        return;
      }
    }

    if (username !== profile.username) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);
      if (profileError) {
        setError(
          profileError.message.includes('duplicate')
            ? 'That username is already taken.'
            : profileError.message
        );
        setSaving(false);
        return;
      }
    }

    setMessage('Profile updated.');
    setPassword('');
    setSaving(false);
  }

  if (loading || !profile) return <p>Loading…</p>;

  return (
    <div className="form-card">
      <h1>Profile Settings</h1>
      <form onSubmit={handleSave}>
        {error && <p className="error-text">{error}</p>}
        {message && <p className="helper-text">{message}</p>}
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>New Password (leave blank to keep current)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <button className="primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

