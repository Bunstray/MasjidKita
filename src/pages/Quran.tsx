import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Filter, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { surahList } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type RevelationFilter = 'all' | 'Makkiyah' | 'Madaniyah';

const revelationFilters: { label: string; value: RevelationFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Makkiyah', value: 'Makkiyah' },
  { label: 'Madaniyah', value: 'Madaniyah' },
];

// Accurate mapping: surah number → juz(es) it spans
// Based on Mushaf Standard Kemenag RI / equran.id reference
// Surahs spanning multiple juz list all juz they appear in
const surahJuz: Record<number, number[]> = {
  1:[1], 2:[1,2,3], 3:[3,4], 4:[4,5,6], 5:[6,7], 6:[7,8], 7:[8,9], 8:[9,10], 9:[10,11], 10:[11],
  11:[11,12], 12:[12,13], 13:[13], 14:[13], 15:[14], 16:[14], 17:[15], 18:[15,16], 19:[16], 20:[16],
  21:[17], 22:[17], 23:[18], 24:[18], 25:[18,19], 26:[19], 27:[19,20], 28:[20], 29:[20,21], 30:[21],
  31:[21], 32:[21], 33:[21,22], 34:[22], 35:[22], 36:[22,23], 37:[23], 38:[23], 39:[23,24], 40:[24],
  41:[24,25], 42:[25], 43:[25], 44:[25], 45:[25], 46:[26], 47:[26], 48:[26], 49:[26], 50:[26],
  51:[26,27], 52:[27], 53:[27], 54:[27], 55:[27], 56:[27], 57:[27], 58:[28], 59:[28], 60:[28],
  61:[28], 62:[28], 63:[28], 64:[28], 65:[28], 66:[28], 67:[29], 68:[29], 69:[29], 70:[29],
  71:[29], 72:[29], 73:[29], 74:[29], 75:[29], 76:[29], 77:[29], 78:[30], 79:[30], 80:[30],
  81:[30], 82:[30], 83:[30], 84:[30], 85:[30], 86:[30], 87:[30], 88:[30], 89:[30], 90:[30],
  91:[30], 92:[30], 93:[30], 94:[30], 95:[30], 96:[30], 97:[30], 98:[30], 99:[30], 100:[30],
  101:[30], 102:[30], 103:[30], 104:[30], 105:[30], 106:[30], 107:[30], 108:[30], 109:[30], 110:[30],
  111:[30], 112:[30], 113:[30], 114:[30],
};

const juzGroups = [
  { label: 'Semua', juzFrom: 0, juzTo: 0 },
  { label: 'Juz 1–5', juzFrom: 1, juzTo: 5 },
  { label: 'Juz 6–10', juzFrom: 6, juzTo: 10 },
  { label: 'Juz 11–15', juzFrom: 11, juzTo: 15 },
  { label: 'Juz 16–20', juzFrom: 16, juzTo: 20 },
  { label: 'Juz 21–25', juzFrom: 21, juzTo: 25 },
  { label: 'Juz 26–30', juzFrom: 26, juzTo: 30 },
];

export default function Quran() {
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');
  const [juzFilter, setJuzFilter] = useState(0); // index into juzGroups
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (revelationFilter !== 'all' ? 1 : 0) + (juzFilter !== 0 ? 1 : 0);

  const filteredSurahs = useMemo(() => {
    let result = surahList;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nameLatin.toLowerCase().includes(q) ||
          s.nameAr.includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.number.toString() === q
      );
    }

    // Revelation type filter
    if (revelationFilter !== 'all') {
      result = result.filter((s) => s.revelationType === revelationFilter);
    }

    // Juz group filter — show surah if ANY of its juz fall within range
    if (juzFilter !== 0) {
      const { juzFrom, juzTo } = juzGroups[juzFilter];
      result = result.filter((s) => {
        const juzList = surahJuz[s.number] || [];
        return juzList.some((j) => j >= juzFrom && j <= juzTo);
      });
    }

    return result;
  }, [searchQuery, revelationFilter, juzFilter]);

  const isSearching = searchQuery.trim().length > 0;

  const clearFilters = () => {
    setRevelationFilter('all');
    setJuzFilter(0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />

      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-[52px] z-30 glass border-b border-white/10 px-4 pb-3 pt-3">
        <div className="mx-auto max-w-lg">
          {/* Search + Filter Toggle Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari surah..."
                className="w-full rounded-xl border border-primary-100 bg-white py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`pressable relative flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary-100 bg-white text-text-muted'
              }`}
              aria-label="Toggle filters"
            >
              <Filter size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Chips Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  {/* Revelation Type */}
                  <div className="mb-2.5">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Jenis Wahyu
                    </p>
                    <div className="flex gap-2">
                      {revelationFilters.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setRevelationFilter(f.value)}
                          className={`pressable rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            revelationFilter === f.value
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-text-secondary shadow-sm'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Juz Range */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Juz
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {juzGroups.map((range, i) => (
                        <button
                          key={i}
                          onClick={() => setJuzFilter(i)}
                          className={`pressable rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            juzFilter === i
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white text-text-secondary shadow-sm'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFilterCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={clearFilters}
                      className="pressable mt-2.5 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <X size={12} />
                      Hapus filter
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result count */}
          {(isSearching || activeFilterCount > 0) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-text-secondary"
            >
              {filteredSurahs.length} surah ditemukan
            </motion.p>
          )}
        </div>
      </div>

      {/* Surah List */}
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-3 pb-24">
        {filteredSurahs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <BookOpen size={28} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              Surah tidak ditemukan
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Coba kata kunci atau filter lain
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="pressable mt-3 rounded-lg bg-primary-50 px-4 py-2 text-xs font-semibold text-primary"
              >
                Hapus semua filter
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${revelationFilter}-${juzFilter}`}
            className="rounded-2xl bg-bg-card shadow-md overflow-hidden"
          >
            {filteredSurahs.map((surah, index) => (
              <motion.div key={surah.number} variants={itemVariants}>
                <Link
                  to={`/quran/${surah.number}`}
                  className="pressable flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-primary-50/50 active:bg-primary-50"
                >
                  {/* Surah Number Circle */}
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                    <svg viewBox="0 0 40 40" className="absolute inset-0 h-10 w-10">
                      <polygon
                        points="20,2 36,11 36,29 20,38 4,29 4,11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-primary/30"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-primary">
                      {surah.number}
                    </span>
                  </div>

                  {/* Surah Info */}
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {surah.nameLatin}
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {surah.nameEn} • {surah.totalVerses} ayat
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-3">
                      <p className="font-arabic text-lg leading-tight text-primary">
                        {surah.nameAr}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          surah.revelationType === 'Makkiyah'
                            ? 'bg-accent-50 text-accent-dark'
                            : 'bg-primary-50 text-primary'
                        }`}
                      >
                        {surah.revelationType}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Divider */}
                {index < filteredSurahs.length - 1 && (
                  <div className="mx-4 border-b border-primary-50" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}


