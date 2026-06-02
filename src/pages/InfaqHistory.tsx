import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Receipt,
  ChevronDown,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  User,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { getReceipts, formatRupiah, formatDate, type InfaqReceipt } from '@/services/infaqReceipt';
import { useAuth } from '@/context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function InfaqHistory() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState<InfaqReceipt[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReceipts(token).then((data) => {
      if (!cancelled) {
        setReceipts(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Compute total donated
  const totalDonated = receipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack title="Riwayat Infaq" />

      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-24">
        {loading ? (
          /* ── Loading Skeleton ── */
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-primary/10 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-gray-50 animate-pulse" />
                  </div>
                  <div className="h-5 w-20 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : receipts.length === 0 ? (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Heart size={32} className="text-primary" />
            </div>
            <p className="mb-1 font-heading text-base font-semibold text-text-primary">
              Belum ada riwayat infaq
            </p>
            <p className="mb-6 text-sm text-text-muted">
              Mulai berdonasi untuk kebaikan bersama
            </p>
            <Link
              to="/infaq"
              className="pressable rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white shadow-md"
            >
              Mulai Berinfaq
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ── Summary Card ── */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 shadow-lg"
            >
              <div className="relative z-10">
                <p className="text-xs font-medium text-white/60">Total Infaq Anda</p>
                <p className="mt-1 font-heading text-2xl font-bold text-white">
                  {formatRupiah(totalDonated)}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {receipts.length} transaksi
                </p>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
            </motion.div>

            {/* ── Receipt List ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {receipts.map((receipt) => {
                const isExpanded = expandedId === receipt.id;
                const isCopied = copiedId === receipt.id;

                return (
                  <motion.div
                    key={receipt.id}
                    variants={itemVariants}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    {/* Card Header — always visible */}
                    <button
                      onClick={() => toggleExpand(receipt.id)}
                      className="pressable flex w-full items-center gap-3.5 px-4 py-4"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                        <Receipt size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {receipt.category}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-muted">
                          {formatDate(receipt.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-primary">
                          {formatRupiah(receipt.amount)}
                        </p>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-text-muted" />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-primary-50 px-4 pb-4 pt-3">
                            <div className="space-y-2.5">
                              {/* Transaction ID */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <Receipt size={12} />
                                  <span className="text-[11px]">ID Transaksi</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(receipt.id);
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-mono font-semibold text-text-primary"
                                >
                                  {receipt.id}
                                  {isCopied ? (
                                    <Check size={10} className="text-primary" />
                                  ) : (
                                    <Copy size={10} className="text-text-muted" />
                                  )}
                                </button>
                              </div>

                              {/* Category */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <Tag size={12} />
                                  <span className="text-[11px]">Kategori</span>
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                  {receipt.category}
                                </span>
                              </div>

                              {/* Payment Method */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <CreditCard size={12} />
                                  <span className="text-[11px]">Metode</span>
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                  {receipt.paymentMethod}
                                </span>
                              </div>

                              {/* Donor */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <User size={12} />
                                  <span className="text-[11px]">Donatur</span>
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                  {receipt.donorName}
                                </span>
                              </div>

                              {/* Date */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <Calendar size={12} />
                                  <span className="text-[11px]">Waktu</span>
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                  {formatDate(receipt.date)}
                                </span>
                              </div>

                              {/* Status */}
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-text-muted">Status</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                                  <CheckCircle2 size={10} />
                                  Berhasil
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
