import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/services/infaqReceipt'; // reuse for consistent dates

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  author_name: string;
  created_at: string;
}

export default function AdminNews() {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Pengumuman');
  const [imageUrl, setImageUrl] = useState('');

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch news', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, category, imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan berita');

      // Reset form and refresh list
      setShowForm(false);
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchNews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchNews();
    } catch (err) {
      console.error('Failed to delete news', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">Kelola Berita</h2>
          <p className="text-sm text-text-muted">{news.length} berita/pengumuman</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Tulis Berita'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm border border-bg-elevated space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Judul Berita</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-text-secondary">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option>Pengumuman</option>
                  <option>Kegiatan</option>
                  <option>Kajian</option>
                  <option>Berita</option>
                </select>
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-text-secondary">URL Gambar (Opsional)</label>
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-3 top-3 text-text-muted" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-bg-primary py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Isi Konten</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="pressable w-full rounded-xl bg-primary py-3 font-heading text-sm font-bold text-white transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Terbitkan Berita'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-bg-elevated">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-primary-50">
                <FileText size={40} className="text-primary/20" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {item.category}
                </span>
                <span className="text-[10px] text-text-muted">{formatDate(item.created_at)}</span>
              </div>
              <h3 className="font-heading font-bold text-text-primary line-clamp-2">{item.title}</h3>
              <p className="mt-1 text-xs text-text-secondary line-clamp-3 flex-1">{item.content}</p>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-[10px] text-text-muted">Oleh: {item.author_name}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="pressable rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                  title="Hapus berita"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
