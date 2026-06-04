import { useState, useEffect } from 'react';
import { Receipt, FileText, Loader2, TrendingUp, Ticket } from 'lucide-react';
import { formatRupiah } from '@/services/infaqReceipt';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInfaq: 0,
    infaqCount: 0,
    newsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch infaq stats
        const resInfaq = await fetch(`/api/admin/infaq`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let infaqTotal = 0;
        let infaqLen = 0;
        if (resInfaq.ok) {
          const data = await resInfaq.json();
          infaqTotal = data.total;
          infaqLen = data.count;
        }

        // Fetch news stats
        const resNews = await fetch(`/api/news`);
        let newsLen = 0;
        if (resNews.ok) {
          const data = await resNews.json();
          newsLen = data.data.length;
        }

        setStats({
          totalInfaq: infaqTotal,
          infaqCount: infaqLen,
          newsCount: newsLen,
        });
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-primary">Dashboard Utama</h2>
        <p className="text-sm text-text-muted">Ringkasan aktivitas platform MasjidKita</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Penerimaan Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-white/80">Total Penerimaan Infaq</p>
          <p className="mt-1 font-heading text-3xl font-bold">{formatRupiah(stats.totalInfaq)}</p>
        </div>

        {/* Total Transaksi Card */}
        <div className="rounded-2xl border border-bg-elevated bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-primary-50 p-2">
              <Receipt size={24} className="text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary">Total Transaksi</p>
          <p className="mt-1 font-heading text-3xl font-bold text-text-primary">{stats.infaqCount}</p>
        </div>

        {/* Total Berita Card */}
        <div className="rounded-2xl border border-bg-elevated bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-primary-50 p-2">
              <FileText size={24} className="text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary">Berita & Pengumuman</p>
          <p className="mt-1 font-heading text-3xl font-bold text-text-primary">{stats.newsCount}</p>
        </div>

        {/* Total E-Kupon Card */}
        <div className="rounded-2xl border border-bg-elevated bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-primary-50 p-2">
              <Ticket size={24} className="text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary">Total E-Kupon</p>
          <p className="mt-1 font-heading text-3xl font-bold text-text-primary">0</p>
        </div>
      </div>
    </div>
  );
}
