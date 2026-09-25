'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, usernameToEmail } from '../../lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Incorrect username or password.');
      return;
    }

    router.push('/');
  }

  return (
    <div className="form-card">
      <h1>Welcome Back</h1>
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
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="helper-text">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}

