import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { formatRupiah, formatDate } from '@/services/infaqReceipt';
import { useAuth } from '@/context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AdminInfaqReceipt {
  id: string;
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  donorName: string;
  isAnonymous: boolean;
}

export default function AdminInfaq() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState<AdminInfaqReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAllInfaq = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/infaq`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReceipts(data.data);
          setTotal(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch admin infaq', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAllInfaq();
    }
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">Data Infaq</h2>
          <p className="text-sm text-text-muted">Total {receipts.length} transaksi tercatat</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-dark p-4 text-white shadow-lg md:min-w-[250px]">
          <p className="text-sm font-medium text-white/80">Total Penerimaan</p>
          <p className="font-heading text-2xl font-bold">{formatRupiah(total)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-bg-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">ID & Waktu</th>
                <th className="px-4 py-3 font-semibold">Donatur</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Metode</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-elevated">
              {receipts.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-bg-primary/50">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-primary">{r.id}</p>
                    <p className="text-[11px] text-text-muted">{formatDate(r.date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-primary">
                      {r.donorName}
                    </p>
                    {r.isAnonymous && (
                      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        Hamba Allah (Anonim)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{r.category}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-heading font-bold text-text-primary">
                    {formatRupiah(r.amount)}
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    Belum ada data infaq
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
