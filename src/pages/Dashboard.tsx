import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Heart,
  Compass,
  BookMarked,
  Newspaper,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { dailyVerses } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const quickActions = [
  { label: 'Waktu Sholat', icon: Clock, to: '/prayer', color: 'bg-primary/10', iconColor: 'text-primary' },
  { label: "Al-Qur'an", icon: BookOpen, to: '/quran', color: 'bg-accent/15', iconColor: 'text-accent-dark' },
  { label: 'Digital Infaq', icon: Heart, to: '/infaq', color: 'bg-red-50', iconColor: 'text-red-500' },
  { label: 'Arah Kiblat', icon: Compass, to: '/qibla', color: 'bg-blue-50', iconColor: 'text-blue-500' },
  { label: "Do'a Harian", icon: BookMarked, to: '/dua', color: 'bg-purple-50', iconColor: 'text-purple-500' },
  { label: 'Berita', icon: Newspaper, to: '/news', color: 'bg-cyan-50', iconColor: 'text-cyan-600' },
];

const categoryColors: Record<string, string> = {
  'kegiatan': 'bg-primary/10 text-primary',
  'pengumuman': 'bg-accent/15 text-accent-dark',
  'kajian': 'bg-purple-100 text-purple-700',
  'berita': 'bg-blue-50 text-blue-600',
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function Dashboard() {
  const { nextPrayer, nextPrayerTime, timeRemaining, schedule, loading } = usePrayerTimes();

  // Rotating daily verse — changes every 30 seconds
  const [verseIndex, setVerseIndex] = useState(() => {
    const today = new Date();
    return (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % dailyVerses.length;
  });

  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVerseIndex((prev) => (prev + 1) % dailyVerses.length);
    }, 30000);

    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
      }
    };
    fetchNews();

    return () => clearInterval(timer);
  }, []);

  const currentVerse = dailyVerses[verseIndex];

  const totalSecondsRemaining =
    timeRemaining.hours * 3600 + timeRemaining.minutes * 60 + timeRemaining.seconds;
  const maxSeconds = 6 * 3600;
  const progress = Math.min(1, 1 - totalSecondsRemaining / maxSeconds);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header transparent />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* ── Hero Section ── */}
        <motion.section variants={itemVariants} className="relative overflow-hidden">
          <div className="pattern-overlay bg-gradient-to-br from-primary-dark via-primary to-primary-400 px-5 pb-28 pt-20">
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-heading text-2xl font-bold text-white"
              >
                Assalamu&apos;alaikum
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-1 text-sm text-white/80"
              >
                {loading ? 'Memuat tanggal...' : schedule.hijriDate}
              </motion.p>
            </div>

            {/* Mosque silhouette decoration */}
            <div className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-[0.07]">
              <svg
                width="220"
                height="160"
                viewBox="0 0 220 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M110 10C110 10 130 30 130 50V70H150V50C150 30 160 20 170 15C180 20 190 30 190 50V70H200V160H20V70H30V50C30 30 40 20 50 15C60 20 70 30 70 50V70H90V50C90 30 110 10 110 10Z"
                  fill="white"
                />
                <circle cx="110" cy="45" r="12" fill="white" />
                <rect x="55" y="100" width="20" height="40" rx="10" fill="white" />
                <rect x="145" y="100" width="20" height="40" rx="10" fill="white" />
                <rect x="95" y="90" width="30" height="50" rx="4" fill="white" />
                <circle cx="50" cy="10" r="4" fill="white" />
                <circle cx="170" cy="10" r="4" fill="white" />
                <rect x="47" y="10" width="6" height="15" fill="white" />
                <rect x="167" y="10" width="6" height="15" fill="white" />
              </svg>
            </div>
          </div>
        </motion.section>

        {/* ── Next Prayer Widget (overlapping hero) ── */}
        <motion.section variants={itemVariants} className="relative z-10 px-5 -mt-20">
          <div className="glass rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Sholat Berikutnya
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold text-primary">
                  {nextPrayer}
                </h3>
                <p className="mt-0.5 text-sm text-text-secondary">{nextPrayerTime}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-text-primary tabular-nums">
                    {pad(timeRemaining.hours)}:{pad(timeRemaining.minutes)}:{pad(timeRemaining.seconds)}
                  </span>
                </div>
              </div>

              {/* Circular progress ring */}
              <div className="relative flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-primary-100"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0F7D5F" />
                      <stop offset="100%" stopColor="#D4A853" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-medium text-text-muted">menuju</span>
                  <span className="font-heading text-sm font-bold text-primary">{nextPrayer}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Quick Actions Grid ── */}
        <motion.section variants={itemVariants} className="mt-6 px-5">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="pressable">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2.5 rounded-2xl bg-bg-card p-4 shadow-sm"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                  >
                    <action.icon size={22} className={action.iconColor} />
                  </div>
                  <span className="text-center text-xs font-medium text-text-primary leading-tight">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── Today's Verse Card (Rotating) ── */}
        <motion.section variants={itemVariants} className="mt-6 px-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark to-primary p-5 shadow-lg">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Ayat Hari Ini
                </p>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={verseIndex}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80"
                  >
                    {currentVerse.reference}
                  </motion.span>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={verseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="arabic-text mt-4 text-center text-2xl leading-[2.2] text-white">
                    {currentVerse.textAr}
                  </p>

                  <div className="mx-auto mt-3 h-px w-16 bg-accent/40" />

                  <p className="mt-3 text-center text-sm leading-relaxed text-white/85">
                    {currentVerse.translation}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots indicator */}
              <div className="mt-4 flex justify-center gap-1.5">
                {dailyVerses.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVerseIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === verseIndex ? 'w-4 bg-accent' : 'w-1.5 bg-white/30'
                    }`}
                    aria-label={`Ayat ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Recent News (horizontal scroll) ── */}
        <motion.section variants={itemVariants} className="mt-6 pb-8">
          <div className="flex items-center justify-between px-5">
            <h3 className="font-heading text-base font-semibold text-text-primary">
              Berita Terbaru
            </h3>
            <Link
              to="/news"
              className="pressable flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              Lihat Semua
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
            {news.slice(0, 4).map((article, index) => (
              <Link key={article.id} to={`/news/${article.id}`} className="pressable flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  className="w-64 rounded-2xl bg-bg-card p-4 shadow-sm"
                >
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      categoryColors[article.category.toLowerCase()] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {article.category}
                  </span>
                  <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
                    {article.title}
                  </h4>
                  <p className="mt-1 text-xs text-text-muted">{article.date || new Date(article.created_at).toLocaleDateString('id-ID')}</p>
                </motion.div>
              </Link>
            ))}
            {news.length === 0 && (
              <p className="text-sm text-text-muted px-2 py-4">Belum ada berita terbaru.</p>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
