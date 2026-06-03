import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, BookOpen, Newspaper, ChevronRight, Ticket } from 'lucide-react';
import Header from '@/components/layout/Header';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'Arah Kiblat',
    path: '/qibla',
    icon: <Compass size={22} />,
    color: 'text-primary',
    bgColor: 'bg-primary-50',
  },
  {
    label: "Kumpulan Do'a",
    path: '/dua',
    icon: <BookOpen size={22} />,
    color: 'text-accent-dark',
    bgColor: 'bg-accent-50',
  },
  {
    label: 'Berita & Pengumuman',
    path: '/news',
    icon: <Newspaper size={22} />,
    color: 'text-info',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'E-Kupon',
    path: '/e-coupons',
    icon: <Ticket size={22} />,
    color: 'text-warning',
    bgColor: 'bg-warning-50',
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function More() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-28 pt-3"
      >
        {/* Menu Section */}
        <motion.section variants={itemVariants}>
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary">Menu Lainnya</h2>
        </motion.section>

        <div className="space-y-2.5">
          {menuItems.map((item) => (
            <motion.button
              key={item.path}
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className="pressable flex w-full items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bgColor} ${item.color}`}
              >
                {item.icon}
              </div>

              <span className="flex-1 text-left font-heading text-sm font-semibold text-text-primary">
                {item.label}
              </span>

              <ChevronRight size={18} className="text-text-muted" />
            </motion.button>
          ))}
        </div>

        {/* App Info Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center py-8"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg">
            <span className="text-2xl">🕌</span>
          </div>

          <h3 className="font-heading text-base font-bold text-text-primary">MasjidKita</h3>
          <p className="mt-0.5 text-xs font-medium text-text-muted">v1.0</p>
          <p className="mt-2 text-xs text-text-secondary">Masjid FMIPA UGM</p>

          <div className="mt-4 h-px w-16 rounded-full bg-primary-100" />

          <p className="mt-4 text-[10px] text-text-muted">
            Dibuat dengan ❤️ untuk kemakmuran masjid
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}
