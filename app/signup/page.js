'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '../../lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: { username: username.trim() }, // read by the handle_new_user() trigger
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'That username is already taken.'
          : signUpError.message
      );
      return;
    }

    router.push('/');
  }

  return (
    <div className="form-card">
      <h1>Join the Archive</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="helper-text">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}

