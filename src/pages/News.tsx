import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, PartyPopper, Megaphone, RefreshCw, Newspaper, BookOpen } from 'lucide-react';
import Header from '@/components/layout/Header';



const filterChips = [
  { label: 'Semua', value: 'all' },
  { label: 'Kegiatan', value: 'Kegiatan' },
  { label: 'Pengumuman', value: 'Pengumuman' },
  { label: 'Kajian', value: 'Kajian' },
  { label: 'Berita', value: 'Berita' },
];

const categoryConfig: Record<string, { gradient: string; badge: string; icon: React.ReactNode }> = {
  'Kegiatan': {
    gradient: 'from-primary/80 to-primary-dark/90',
    badge: 'bg-primary/90 text-white',
    icon: <PartyPopper size={28} className="text-white/70" />,
  },
  'Pengumuman': {
    gradient: 'from-info/80 to-blue-700/90',
    badge: 'bg-info/90 text-white',
    icon: <Megaphone size={28} className="text-white/70" />,
  },
  'Kajian': {
    gradient: 'from-purple-500/80 to-purple-700/90',
    badge: 'bg-purple-500/90 text-white',
    icon: <BookOpen size={28} className="text-white/70" />,
  },
  'Berita': {
    gradient: 'from-amber-500/80 to-amber-700/90',
    badge: 'bg-amber-500/90 text-white',
    icon: <RefreshCw size={28} className="text-white/70" />,
  },
};

export default function News() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [newsArticles, setNewsArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setNewsArticles(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
      }
    };
    fetchNews();
  }, []);

  const filteredArticles = useMemo(
    () =>
      activeFilter === 'all'
        ? newsArticles
        : newsArticles.filter((a) => a.category === activeFilter),
    [activeFilter]
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-4 pb-28 pt-3"
      >
        {/* Filter Chips */}
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {filterChips.map((chip, idx) => {
            const isActive = activeFilter === chip.value;
            return (
              <motion.button
                key={chip.value}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveFilter(chip.value)}
                className={`pressable whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-text-secondary shadow-sm'
                }`}
              >
                {chip.label}
              </motion.button>
            );
          })}
        </div>

        {/* News Feed */}
        <AnimatePresence mode="popLayout">
          {filteredArticles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-elevated">
                <Newspaper size={28} className="text-text-muted" />
              </div>
              <p className="font-heading text-base font-semibold text-text-secondary">
                Tidak ada berita
              </p>
              <p className="mt-1 text-sm text-text-muted">Belum ada berita untuk kategori ini</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article, idx) => {
                const config = categoryConfig[article.category] || categoryConfig['Berita'];
                return (
                  <motion.article
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.08, duration: 0.35 }}
                    className="pressable overflow-hidden rounded-xl bg-white shadow-md"
                  >
                    {/* Image placeholder with gradient */}
                    <div
                      className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${config.gradient}`}
                    >
                      {config.icon}

                      {/* Category badge */}
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}
                      >
                        {article.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="mb-2 font-heading text-base font-bold leading-snug text-text-primary">
                        {article.title}
                      </h3>

                      <div className="mb-2 flex items-center gap-1.5">
                        <Calendar size={12} className="text-text-muted" />
                        <span className="text-xs text-text-muted">
                          {article.date || new Date(article.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
                        {article.excerpt}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
