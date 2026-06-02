import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get return URL from location state or default to home/admin
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      login(data.data.user, data.data.token);

      // Navigate to return URL or role-based default
      if (from) {
        navigate(from, { replace: true });
      } else if (data.data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Simple Header */}
      <div className="flex items-center px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-primary">Masuk</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Selamat datang kembali di MasjidKita
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Email</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border-2 border-transparent bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border-2 border-transparent bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-heading text-sm font-bold text-white shadow-lg disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Daftar Sekarang
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
