'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../lib/AuthProvider';
import { supabase } from '../../lib/supabase';

const TYPES = [
  { key: 'photo', label: '📷 Photo', accept: 'image/*' },
  { key: 'video', label: '🎞️ Video', accept: 'video/*' },
  { key: 'audio', label: '🎵 Audio', accept: 'audio/*' },
  { key: 'text', label: '📝 Note', accept: null },
];

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [type, setType] = useState('photo');
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (type !== 'text' && !file) {
      setError('Please choose a file to upload.');
      return;
    }
    if (type === 'text' && !body.trim()) {
      setError('Please write something to save.');
      return;
    }

    setSubmitting(true);

    let media_url = null;
    let media_path = null;

    if (type !== 'text') {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('archive-media')
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('archive-media')
        .getPublicUrl(path);

      media_url = publicUrlData.publicUrl;
      media_path = path;
    }

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: user.id,
      type,
      caption: caption.trim() || null,
      body: type === 'text' ? body.trim() : null,
      media_url,
      media_path,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/');
  }

  return (
    <div className="upload-card">
      <h1>Preserve a Memory</h1>

      <div className="type-tabs">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={type === t.key ? 'active' : ''}
            onClick={() => {
              setType(t.key);
              setFile(null);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        {type !== 'text' ? (
          <input
            type="file"
            accept={TYPES.find((t) => t.key === type).accept}
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        ) : (
          <textarea
            rows={6}
            placeholder="Write your memory…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        )}

        <input
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add to Archive'}
        </button>
      </form>
    </div>
  );
}

