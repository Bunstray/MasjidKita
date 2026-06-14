import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Trash2, Ticket, ChevronDown, ChevronUp, QrCode, X, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import QRCode from 'qrcode';

interface CouponEvent {
  id: number;
  description: string;
  totalQuantity: number;
  validUntil: string;
  createdAt: string;
  totalCodes: number;
  claimedCount: number;
}

interface CouponCode {
  id: number;
  code: string;
  isClaimed: boolean;
  claimedAt: string | null;
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminEKupon() {
  const { token } = useAuth();
  const [events, setEvents] = useState<CouponEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [validUntil, setValidUntil] = useState('');

  // Expanded event
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [eventCoupons, setEventCoupons] = useState<CouponCode[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // QR modal
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data);
      } else {
        setError('Gagal memuat data kupon');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchEvents();
  }, [token, fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.length < 3 || !validUntil) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description, quantity, validUntil }),
      });
      if (res.ok) {
        setDescription('');
        setQuantity(10);
        setValidUntil('');
        setShowForm(false);
        await fetchEvents();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Gagal membuat kupon');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Hapus event kupon ini beserta semua kode kuponnya?')) return;
    try {
      await fetch(`/api/admin/coupons/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpandedEventId(null);
      await fetchEvents();
    } catch {
      setError('Gagal menghapus kupon');
    }
  };

  const toggleExpand = async (eventId: number) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      setEventCoupons([]);
      return;
    }
    setExpandedEventId(eventId);
    setLoadingCoupons(true);
    try {
      const res = await fetch(`/api/admin/coupons/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEventCoupons(data.data.coupons);
      }
    } catch {
      console.error('Failed to fetch coupons');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const showQR = async (code: string) => {
    try {
      const url = await QRCode.toDataURL(code, { width: 300, margin: 2 });
      setQrCode(code);
      setQrImage(url);
    } catch {
      console.error('Failed to generate QR');
    }
  };

  const downloadQR = () => {
    if (!qrImage || !qrCode) return;
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `kupon-${qrCode}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">E-Kupon</h2>
          <p className="text-sm text-text-muted">Kelola event kupon makanan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Buat Event'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-bg-elevated bg-white p-5 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Event</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Jumat Berkah"
                  className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Jumlah Kupon</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={500}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Berlaku Hingga</label>
                  <input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="pressable w-full rounded-xl bg-primary py-3 font-heading text-sm font-bold text-white transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Membuat...' : 'Buat Kupon'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Cards */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <Ticket size={28} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Belum ada event kupon</p>
          <p className="mt-1 text-xs text-text-muted">Buat event baru untuk memulai</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const isExpanded = expandedEventId === event.id;
            const progress = event.totalCodes > 0 ? event.claimedCount / event.totalCodes : 0;
            const isExpired = new Date(event.validUntil) < new Date();

            return (
              <motion.div
                key={event.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-bg-elevated bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                        <Ticket size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-text-primary">{event.description}</h3>
                        <p className="text-xs text-text-muted">
                          {event.claimedCount}/{event.totalCodes} diklaim
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="pressable rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                    <span className={isExpired ? 'text-red-500 font-semibold' : ''}>
                      {isExpired ? 'Kadaluarsa' : `Berlaku hingga ${new Date(event.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="pressable flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary transition-colors hover:bg-primary-50"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Tutup' : 'Lihat Kode'}
                    </button>
                  </div>
                </div>

                {/* Expanded: Coupon Codes */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-bg-elevated"
                    >
                      <div className="max-h-64 space-y-1 overflow-y-auto p-3">
                        {loadingCoupons ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={20} className="animate-spin text-primary" />
                          </div>
                        ) : (
                          eventCoupons.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between rounded-lg bg-bg-primary px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                {c.isClaimed ? (
                                  <CheckCircle2 size={14} className="text-green-500" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                                )}
                                <span className="font-mono text-xs font-semibold text-text-primary">
                                  {c.code}
                                </span>
                                {c.isClaimed && (
                                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                                    Diklaim
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => showQR(c.code)}
                                className="pressable rounded-lg bg-primary-50 p-1.5 text-primary transition-colors hover:bg-primary-100"
                                title="Generate QR"
                              >
                                <QrCode size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      <AnimatePresence>
        {qrCode && qrImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => { setQrCode(null); setQrImage(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-text-primary">Kode QR Kupon</h3>
                <button
                  onClick={() => { setQrCode(null); setQrImage(null); }}
                  className="pressable rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-elevated"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <img src={qrImage} alt={`QR: ${qrCode}`} className="rounded-lg" width={250} height={250} />
                <p className="mt-3 font-mono text-sm font-bold text-primary">{qrCode}</p>
                <button
                  onClick={downloadQR}
                  className="pressable mt-4 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
                >
                  <Download size={16} />
                  Download QR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
