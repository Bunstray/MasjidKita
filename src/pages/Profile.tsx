import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Receipt, ShieldCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; // or a redirect handled by ProtectedRoute
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack title="Profil Saya" />

      <main className="flex-1 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg space-y-6"
        >
          {/* User Info Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <User size={40} className="text-white" />
              </div>
              <h2 className="font-heading text-xl font-bold">{user.name}</h2>
              <p className="mt-1 text-sm text-white/80">{user.email}</p>
              {user.role === 'admin' && (
                <div className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-champagne/20 px-3 py-1 text-xs font-semibold text-champagne-light">
                  <ShieldCheck size={14} />
                  Administrator
                </div>
              )}
            </div>
            
            <div className="p-4">
              <button
                onClick={() => navigate('/infaq/history')}
                className="pressable flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-bg-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <Receipt size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm font-semibold text-text-primary">Riwayat Infaq</p>
                  <p className="text-xs text-text-muted">Lihat semua donasi Anda</p>
                </div>
              </button>
              
              {user.role === 'admin' && (
                 <button
                 onClick={() => navigate('/admin')}
                 className="pressable flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-bg-elevated mt-2"
               >
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                   <ShieldCheck size={20} />
                 </div>
                 <div className="flex-1">
                   <p className="font-heading text-sm font-semibold text-text-primary">Dashboard Admin</p>
                   <p className="text-xs text-text-muted">Kelola infaq dan berita</p>
                 </div>
               </button>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="pressable flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-4 font-heading text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut size={18} />
            Keluar Akun
          </button>
        </motion.div>
      </main>
    </div>
  );
}
