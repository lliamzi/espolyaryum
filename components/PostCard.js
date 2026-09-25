'use client';

import { useAuth } from '../lib/AuthProvider';
import { supabase } from '../lib/supabase';

export default function PostCard({ post, onDeleted }) {
  const { user, profile } = useAuth();

  // Role-based deletion: shown only if you own the post OR you're an admin.
  // The actual enforcement happens server-side via RLS policies in schema.sql —
  // this check just controls whether the button is shown.
  const canDelete = user && (user.id === post.user_id || profile?.is_admin);

  async function handleDelete() {
    if (!confirm('Delete this memory permanently?')) return;

    if (post.media_path) {
      await supabase.storage.from('archive-media').remove([post.media_path]);
    }
    const { error } = await supabase.from('posts').delete().eq('id', post.id);

    if (error) {
      alert('Could not delete: ' + error.message);
      return;
    }
    onDeleted?.(post.id);
  }

  return (
    <div className="polaroid">
      {post.type === 'photo' && <img src={post.media_url} alt={post.caption || 'memory'} />}
      {post.type === 'video' && <video src={post.media_url} controls />}
      {post.type === 'audio' && (
        <audio src={post.media_url} controls style={{ width: '100%', marginTop: '0.5rem' }} />
      )}
      {post.type === 'text' && <div className="text-note">{post.body}</div>}

      {post.caption && <p className="caption">{post.caption}</p>}

      <div className="meta">
        <span>
          {post.author_username || 'someone'} · {new Date(post.created_at).toLocaleDateString()}
        </span>
        {canDelete && <button onClick={handleDelete}>delete</button>}
      </div>
    </div>
  );
        }
       
