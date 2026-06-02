import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, BookOpen, Loader2, WifiOff, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { surahList, sampleVerses } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const verseVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Types for equran.id API response ──
interface EquranAyat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
}

interface EquranSuratResponse {
  code: number;
  data: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    ayat: EquranAyat[];
  };
}

interface Verse {
  number: number;
  textAr: string;
  translation: string;
  transliteration: string;
}

// ── Module-level cache so we don't re-fetch ──
const verseCache = new Map<number, Verse[]>();

function mapEquranToVerses(ayat: EquranAyat[]): Verse[] {
  return ayat.map((a) => ({
    number: a.nomorAyat,
    textAr: a.teksArab,
    translation: a.teksIndonesia,
    transliteration: a.teksLatin,
  }));
}

export default function QuranReader() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const navigate = useNavigate();
  const [arabicFontSize, setArabicFontSize] = useState(28);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll to show/hide floating back button
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const surahNum = Number(surahNumber);

  const surah = useMemo(
    () => surahList.find((s) => s.number === surahNum),
    [surahNum]
  );

  // ── Fetch verses from equran.id API (Kemenag RI), fallback to local data ──
  useEffect(() => {
    if (!surah) return;

    let cancelled = false;

    async function fetchVerses() {
      setLoading(true);
      setError(false);

      // 1. Check module-level cache
      if (verseCache.has(surahNum)) {
        setVerses(verseCache.get(surahNum)!);
        setLoading(false);
        return;
      }

      // 2. Check local mock data
      const local = sampleVerses[surahNum];
      if (local && local.length > 0) {
        verseCache.set(surahNum, local);
        setVerses(local);
        setLoading(false);
        return;
      }

      // 3. Fetch from equran.id API
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${surahNum}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: EquranSuratResponse = await res.json();

        if (!cancelled && json.code === 200 && json.data?.ayat) {
          const mapped = mapEquranToVerses(json.data.ayat);
          verseCache.set(surahNum, mapped);
          setVerses(mapped);
        }
      } catch {
        if (!cancelled) {
          // Final fallback: show local data if any, else show error
          const fallback = sampleVerses[surahNum];
          if (fallback && fallback.length > 0) {
            setVerses(fallback);
          } else {
            setError(true);
            setVerses(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVerses();
    return () => { cancelled = true; };
  }, [surahNum, surah]);

  const increaseFontSize = () => setArabicFontSize((s) => Math.min(s + 2, 44));
  const decreaseFontSize = () => setArabicFontSize((s) => Math.max(s - 2, 18));

  if (!surah) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header showBack title="Al-Qur'an" />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <BookOpen size={28} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              Surah tidak ditemukan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showBismillah = surahNum !== 9 && surahNum !== 1;

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack title={surah.nameLatin} />

      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-28">
        {/* Decorative Surah Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary-700 p-6 shadow-lg pattern-overlay"
        >
          <div className="relative z-10 text-center">
            <h2 className="font-arabic text-3xl leading-relaxed text-white/95">
              {surah.nameAr}
            </h2>
            <p className="mt-1 font-heading text-lg font-semibold text-white">
              {surah.nameLatin}
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              {surah.nameEn}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                {surah.revelationType}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                {surah.totalVerses} Ayat
              </span>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        </motion.div>

        {/* Bismillah */}
        {showBismillah && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 text-center"
          >
            <p className="arabic-text font-arabic text-2xl leading-loose text-text-primary">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-bg-card shadow-md overflow-hidden"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-full rounded-lg bg-primary-50/60 animate-pulse" />
                    <div className="h-6 w-3/4 rounded-lg bg-primary-50/40 animate-pulse" />
                  </div>
                </div>
                <div className="mt-3 pl-11 space-y-1.5">
                  <div className="h-3.5 w-5/6 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3.5 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-3.5 w-2/3 rounded bg-gray-100 animate-pulse" />
                </div>
                {i < 4 && <div className="mx-0 mt-5 border-b border-primary-50" />}
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 py-4 text-primary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium">Memuat ayat...</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-bg-card py-16 shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <WifiOff size={28} className="text-red-400" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              Gagal memuat ayat
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Periksa koneksi internet Anda
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setError(false);
                // Re-trigger by clearing cache and resetting
                verseCache.delete(surahNum);
                fetch(`https://equran.id/api/v2/surat/${surahNum}`)
                  .then((r) => r.json())
                  .then((json: EquranSuratResponse) => {
                    if (json.code === 200 && json.data?.ayat) {
                      const mapped = mapEquranToVerses(json.data.ayat);
                      verseCache.set(surahNum, mapped);
                      setVerses(mapped);
                    }
                  })
                  .catch(() => setError(true))
                  .finally(() => setLoading(false));
              }}
              className="pressable mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md"
            >
              Coba lagi
            </button>
          </motion.div>
        )}

        {/* Verses */}
        {!loading && !error && verses && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-0 rounded-2xl bg-bg-card shadow-md overflow-hidden"
          >
            {verses.map((verse, index) => (
              <motion.div key={verse.number} variants={verseVariants}>
                <div className="px-5 py-5">
                  {/* Verse number + Arabic */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 mt-2">
                      <span className="text-xs font-bold text-primary">
                        {verse.number}
                      </span>
                    </div>
                    <p
                      className="arabic-text flex-1 font-arabic leading-[2.2] text-text-primary"
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {verse.textAr}
                    </p>
                  </div>

                  {/* Transliteration */}
                  <p className="mt-3 text-sm italic text-text-muted pl-11">
                    {verse.transliteration}
                  </p>

                  {/* Translation */}
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary pl-11">
                    {verse.translation}
                  </p>
                </div>

                {/* Divider */}
                {index < verses.length - 1 && (
                  <div className="mx-5 border-b border-primary-50" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No data at all */}
        {!loading && !error && !verses && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-bg-card py-16 shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <BookOpen size={28} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              Data surah ini belum tersedia
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Insya Allah segera ditambahkan
            </p>
          </motion.div>
        )}
      </div>

      {/* Floating Back Button (left side) */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onClick={() => navigate(-1)}
            className="pressable fixed bottom-28 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg border border-primary-100 active:bg-primary-50"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Font Size Controls (right side) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-24 right-4 z-30 flex flex-col items-center gap-2"
      >
        <button
          onClick={increaseFontSize}
          className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg active:bg-primary-dark"
          aria-label="Increase font size"
        >
          <Plus size={18} />
        </button>
        <span className="text-[10px] font-semibold text-text-muted bg-bg-card rounded-full px-2 py-0.5 shadow-sm">
          {arabicFontSize}
        </span>
        <button
          onClick={decreaseFontSize}
          className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg border border-primary-100 active:bg-primary-50"
          aria-label="Decrease font size"
        >
          <Minus size={18} />
        </button>
      </motion.div>
    </div>
  );
}
