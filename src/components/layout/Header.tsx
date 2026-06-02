import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  rightAction?: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/': 'MasjidKita',
  '/prayer': 'Waktu Sholat',
  '/quran': "Al-Qur'an",
  '/infaq': 'Digital Infaq',
  '/qibla': 'Arah Kiblat',
  '/news': 'Berita & Pengumuman',
  '/dua': "Kumpulan Do'a",
  '/more': 'Lainnya',
};

export default function Header({ title, showBack = false, transparent = false, rightAction }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayTitle = title || pageTitles[location.pathname] || 'MasjidKita';
  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${transparent ? 'absolute w-full' : 'sticky'} top-0 z-40 safe-top ${
        transparent
          ? 'bg-transparent'
          : 'glass border-b border-white/10'
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {(showBack || (!isHome && !pageTitles[location.pathname])) && (
            <button
              onClick={() => navigate(-1)}
              className="pressable tap-target -ml-2 flex items-center justify-center rounded-xl"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-text-primary" />
            </button>
          )}
          <div>
            {isHome ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-white">🕌</span>
                </div>
                <div>
                  <h1 className="font-heading text-lg font-bold text-text-primary leading-tight">
                    MasjidKita
                  </h1>
                  <p className="text-[11px] font-medium text-text-muted">
                    Masjid FMIPA UGM
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="font-heading text-lg font-bold text-text-primary">
                {displayTitle}
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {isHome && (
            <Link
              to={user ? "/profile" : "/login"}
              className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            >
              {user ? <User size={20} /> : <LogIn size={20} />}
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
