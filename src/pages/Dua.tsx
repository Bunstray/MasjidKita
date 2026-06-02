import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Heart,
  Sunrise,
  Moon,
  MapPin,
  UtensilsCrossed,
  Shield,
  BookOpen,
  FolderOpen,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { duaCategories, duas } from '@/data/mockData';
import { useBookmarks } from '@/context/BookmarkContext';

type TabType = 'kategori' | 'tersimpan';

const iconMap: Record<string, React.ReactNode> = {
  sunrise: <Sunrise size={22} />,
  moon: <Moon size={22} />,
  map: <MapPin size={22} />,
  'utensils-crossed': <UtensilsCrossed size={22} />,
  shield: <Shield size={22} />,
  'book-open': <BookOpen size={22} />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dua() {
  const [activeTab, setActiveTab] = useState<TabType>('kategori');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const selectedCategory = useMemo(
    () => duaCategories.find((c) => c.id === selectedCategoryId) ?? null,
    [selectedCategoryId]
  );

  const filteredDuas = useMemo(() => {
    let result = duas;

    if (activeTab === 'tersimpan') {
      result = result.filter((d) => bookmarks.includes(d.id));
    } else if (selectedCategoryId) {
      result = result.filter((d) => d.categoryId === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.titleAr.includes(q) ||
          d.translation.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeTab, selectedCategoryId, searchQuery, bookmarks]);

  const showDuaList =
    activeTab === 'tersimpan' || selectedCategoryId !== null || searchQuery.trim().length > 0;

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />

      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-3 pb-24">
        {/* Tab Switcher */}
        <div className="mb-4 flex rounded-xl bg-bg-elevated p-1">
          {(['kategori', 'tersimpan'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedCategoryId(null);
                setSearchQuery('');
              }}
              className={`pressable relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted'
              }`}
            >
              {tab === 'kategori' ? 'Kategori' : 'Tersimpan'}
              {tab === 'tersimpan' && bookmarks.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {bookmarks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari do'a..."
            className="w-full rounded-xl border border-primary-100 bg-white py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Categories Grid */}
          {activeTab === 'kategori' && !showDuaList && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                {duaCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    variants={itemVariants}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="pressable flex flex-col items-center rounded-2xl bg-bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <span style={{ color: category.color }}>
                        {iconMap[category.icon] ?? <BookOpen size={22} />}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {category.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {category.count} do&apos;a
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Du'a List */}
          {showDuaList && (
            <motion.div
              key="dua-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Back to categories button (only in kategori tab with selected category) */}
              {activeTab === 'kategori' && selectedCategoryId && (
                <button
                  onClick={handleBackToCategories}
                  className="pressable mb-4 flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <ArrowLeft size={16} />
                  <span>{selectedCategory?.name ?? 'Kategori'}</span>
                </button>
              )}

              {filteredDuas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                    <FolderOpen size={28} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-secondary">
                    {activeTab === 'tersimpan'
                      ? "Belum ada do'a tersimpan"
                      : "Do'a tidak ditemukan"}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {activeTab === 'tersimpan'
                      ? 'Ketuk ikon hati untuk menyimpan'
                      : 'Coba kata kunci lain'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {filteredDuas.map((dua) => (
                    <motion.div
                      key={dua.id}
                      variants={itemVariants}
                      className="rounded-2xl bg-bg-card p-5 shadow-sm"
                    >
                      {/* Title + Bookmark */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-text-primary">
                            {dua.title}
                          </h3>
                          <p className="mt-0.5 font-arabic text-sm text-text-muted">
                            {dua.titleAr}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleBookmark(dua.id)}
                          className="pressable tap-target -mr-2 -mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                          aria-label={
                            isBookmarked(dua.id) ? 'Remove bookmark' : 'Add bookmark'
                          }
                        >
                          <Heart
                            size={20}
                            className={
                              isBookmarked(dua.id)
                                ? 'fill-accent text-accent'
                                : 'text-text-muted'
                            }
                          />
                        </button>
                      </div>

                      {/* Arabic Text */}
                      <div className="mt-4 rounded-xl bg-primary-50/50 p-4">
                        <p className="arabic-text font-arabic text-xl leading-[2.2] text-text-primary">
                          {dua.textAr}
                        </p>
                      </div>

                      {/* Transliteration */}
                      <p className="mt-3 text-sm italic leading-relaxed text-text-muted">
                        {dua.transliteration}
                      </p>

                      {/* Translation */}
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {dua.translation}
                      </p>

                      {/* Source */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-accent" />
                        <p className="text-xs font-medium text-accent-dark">
                          {dua.source}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
