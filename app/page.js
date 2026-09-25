'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    // Join posts with profiles to show each author's username
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles ( username )')
      .order('created_at', { ascending: false });

    if (!error) {
      setPosts(
        data.map((p) => ({ ...p, author_username: p.profiles?.username }))
      );
    }
    setLoading(false);
  }

  function handleDeleted(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <h1>The Archive</h1>
      <p className="helper-text">A shared vault of photos, videos, music, and memories.</p>

      {loading && <p>Loading the archive…</p>}
      {!loading && posts.length === 0 && <p>No memories saved yet. Be the first.</p>}

      <div className="feed-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  );
}

