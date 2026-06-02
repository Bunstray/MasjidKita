import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Newspaper, ChevronLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await fetch(`/api/news/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch news detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header showBack={true} title="Detail Berita" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header showBack={true} title="Detail Berita" />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <Newspaper size={48} className="mb-4 text-text-muted" />
          <h2 className="font-heading text-lg font-bold text-text-primary">Berita tidak ditemukan</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Mungkin berita ini sudah dihapus atau URL tidak valid.
          </p>
          <Link
            to="/news"
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            Kembali ke Berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Sticky Header with Back Button overlay on image */}
      <div className="fixed top-0 z-50 flex w-full max-w-[480px] items-center justify-between p-4">
        <Link
          to="/news"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
        >
          <ChevronLeft size={24} />
        </Link>
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 pb-28"
      >
        {/* Hero Image */}
        <div className="relative h-64 w-full bg-primary/20 sm:h-72">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-primary/80', 'to-primary-dark/90');
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary-dark/90">
              <Newspaper size={48} className="text-white/50" />
            </div>
          )}
          
          {/* Bottom Gradient for text readability */}
          <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-bg-primary to-transparent" />
        </div>

        {/* Content */}
        <div className="relative -mt-6 rounded-t-3xl bg-bg-primary px-5 pt-8">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {article.category}
          </span>
          
          <h1 className="mb-4 font-heading text-2xl font-bold leading-tight text-text-primary">
            {article.title}
          </h1>

          <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 border-b border-border/50 pb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <Calendar size={14} />
              <span>{article.date || new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {article.author_name && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <User size={14} />
                <span>Oleh: {article.author_name}</span>
              </div>
            )}
          </div>

          <div className="prose prose-sm prose-slate max-w-none text-text-secondary">
            {article.content.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
