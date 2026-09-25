'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthProvider';
import { supabase } from '../lib/supabase';

export default function NavBar() {
  const { user, profile } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="navbar">
      <Link href="/" className="brand">📷 Espolyaryum Archive</Link>
      <nav>
        {user ? (
          <>
            <Link href="/upload">Add Memory</Link>
            <Link href="/profile">{profile?.username || 'Profile'}</Link>
            {profile?.is_admin && <span className="badge">admin</span>}
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

