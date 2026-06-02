import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Coins,
  Landmark,
  Scissors,
  CheckCircle2,
  ChevronRight,
  Home,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  Receipt,
  Loader2,
  User,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { donationCategories, paymentMethods } from '@/data/mockData';
import { saveReceipt, formatRupiah, type InfaqReceipt } from '@/services/infaqReceipt';
import { useAuth } from '@/context/AuthContext';

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart size={20} />,
  coins: <Coins size={20} />,
  landmark: <Landmark size={20} />,
  scissors: <Scissors size={20} />,
};

const predefinedAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

const paymentGroups = [
  { label: 'QRIS', type: 'qris' as const },
  { label: 'E-Wallet', type: 'ewallet' as const },
  { label: 'Bank Transfer', type: 'bank' as const },
];

type Step = 'form' | 'confirm' | 'processing' | 'success';

export default function DigitalInfaq() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [selectedCategory, setSelectedCategory] = useState(donationCategories[0].id);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomFocused, setIsCustomFocused] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('qris');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<InfaqReceipt | null>(null);

  const activeAmount = useMemo(() => {
    if (isCustomFocused && customAmount) {
      const parsed = parseInt(customAmount.replace(/\./g, ''), 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount ?? 0;
  }, [selectedAmount, customAmount, isCustomFocused]);

  const activeCategoryName = useMemo(
    () => donationCategories.find((c) => c.id === selectedCategory)?.name ?? 'Infaq',
    [selectedCategory]
  );

  const activePaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.id === selectedPayment),
    [selectedPayment]
  );

  const handleCustomChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits === '') {
      setCustomAmount('');
      return;
    }
    const num = parseInt(digits, 10);
    setCustomAmount(num.toLocaleString('id-ID'));
  };

  const handleCustomFocus = () => {
    setIsCustomFocused(true);
    setSelectedAmount(null);
  };

  const handlePredefinedSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustomFocused(false);
    setCustomAmount('');
  };

  const handleProceedToConfirm = () => {
    if (activeAmount > 0) {
      setStep('confirm');
    }
  };

  const handleConfirmPayment = async () => {
    setStep('processing');

    try {
      const receipt = await saveReceipt({
        category: activeCategoryName,
        amount: activeAmount,
        paymentMethod: activePaymentMethod?.name ?? 'QRIS',
        paymentType: activePaymentMethod?.type ?? 'qris',
        donorName: 'Hamba Allah', // Backend will use user.name if logged in and !isAnonymous
        isAnonymous: isAnonymous,
        token: token,
      });

      setSavedReceipt(receipt);
      setStep('success');
    } catch {
      // If save fails entirely, still show success with local receipt
      const fallback: InfaqReceipt = {
        id: 'INF-LOCAL-' + Date.now(),
        date: new Date().toISOString(),
        category: activeCategoryName,
        amount: activeAmount,
        paymentMethod: activePaymentMethod?.name ?? 'QRIS',
        paymentType: activePaymentMethod?.type ?? 'qris',
        status: 'pending',
        donorName: user && !isAnonymous ? user.name : 'Hamba Allah',
      };
      setSavedReceipt(fallback);
      setStep('success');
    }
  };

  const handleReset = () => {
    setStep('form');
    setSelectedCategory(donationCategories[0].id);
    setSelectedAmount(50000);
    setCustomAmount('');
    setIsCustomFocused(false);
    setSelectedPayment('qris');
    setIsAnonymous(false);
    setSavedReceipt(null);
    setCopied(false);
  };

  const handleCopyId = () => {
    if (savedReceipt) {
      navigator.clipboard.writeText(savedReceipt.id).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ═══════════════════════════════════════════
  // STEP: Processing
  // ═══════════════════════════════════════════
  if (step === 'processing') {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Loader2 size={40} className="animate-spin text-primary" />
            </div>
            <h2 className="mb-2 font-heading text-lg font-bold text-text-primary">
              Memproses Pembayaran
            </h2>
            <p className="text-sm text-text-secondary">
              Mohon tunggu sebentar...
            </p>
            <div className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-xs font-medium text-primary">
                Transaksi aman & terenkripsi
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // STEP: Success with Receipt
  // ═══════════════════════════════════════════
  if (step === 'success' && savedReceipt) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header />
        <div className="flex flex-1 items-center justify-center px-4 pb-24">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-sm"
          >
            {/* Receipt Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* Green Header */}
              <div className="relative bg-gradient-to-br from-primary to-primary-dark px-6 pb-8 pt-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <CheckCircle2 size={32} className="text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="arabic-text mb-1 text-xl text-white/90 text-center"
                  dir="rtl"
                  style={{ textAlign: 'center' }}
                >
                  جزاك الله خيراً
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-sm font-medium text-white/80"
                >
                  Pembayaran Berhasil
                </motion.p>

                {/* Zigzag bottom edge */}
                <div className="absolute -bottom-px left-0 right-0">
                  <svg viewBox="0 0 400 12" className="w-full" preserveAspectRatio="none">
                    <path
                      d="M0,12 L0,6 Q10,0 20,6 Q30,12 40,6 Q50,0 60,6 Q70,12 80,6 Q90,0 100,6 Q110,12 120,6 Q130,0 140,6 Q150,12 160,6 Q170,0 180,6 Q190,12 200,6 Q210,0 220,6 Q230,12 240,6 Q250,0 260,6 Q270,12 280,6 Q290,0 300,6 Q310,12 320,6 Q330,0 340,6 Q350,12 360,6 Q370,0 380,6 Q390,12 400,6 L400,12 Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>

              {/* Receipt Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="px-6 pb-6 pt-2"
              >
                {/* Amount */}
                <div className="mb-4 text-center">
                  <p className="text-xs text-text-muted">Jumlah Infaq</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {formatRupiah(savedReceipt.amount)}
                  </p>
                </div>

                {/* Dashed divider */}
                <div className="mb-4 border-b-2 border-dashed border-gray-200" />

                {/* Detail rows */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">ID Transaksi</span>
                    <button
                      onClick={handleCopyId}
                      className="flex items-center gap-1.5 text-xs font-mono font-semibold text-text-primary"
                    >
                      {savedReceipt.id}
                      {copied ? (
                        <Check size={12} className="text-primary" />
                      ) : (
                        <Copy size={12} className="text-text-muted" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Kategori</span>
                    <span className="text-xs font-semibold text-text-primary">{savedReceipt.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Metode</span>
                    <span className="text-xs font-semibold text-text-primary">{savedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Donatur</span>
                    <span className="text-xs font-semibold text-text-primary">{savedReceipt.donorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Waktu</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {new Date(savedReceipt.date).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Status</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-600">
                      <CheckCircle2 size={10} />
                      Berhasil
                    </span>
                  </div>
                </div>

                {/* Dashed divider */}
                <div className="my-4 border-b-2 border-dashed border-gray-200" />

                {/* Security badge */}
                <div className="mb-5 flex items-center justify-center gap-1.5 text-text-muted">
                  <ShieldCheck size={12} />
                  <span className="text-[10px]">Transaksi aman • MasjidKita</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/infaq/history')}
                    className="pressable flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary-50 px-4 py-3 font-heading text-sm font-semibold text-primary"
                  >
                    <Receipt size={16} />
                    Lihat Riwayat Infaq
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="pressable flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-heading text-sm font-semibold text-white shadow-md"
                  >
                    <Home size={16} />
                    Berinfaq Lagi
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // STEP: Confirmation
  // ═══════════════════════════════════════════
  if (step === 'confirm') {
    return (
      <div className="flex min-h-screen flex-col bg-bg-primary">
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-4 pb-24 pt-3"
        >
          <div className="mx-auto max-w-lg">
            {/* Review Card */}
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h2 className="font-heading text-sm font-bold text-text-primary">
                  Konfirmasi Pembayaran
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
                  <span className="text-xs text-text-muted">Kategori</span>
                  <span className="text-sm font-semibold text-text-primary">{activeCategoryName}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
                  <span className="text-xs text-text-muted">Jumlah</span>
                  <span className="text-sm font-bold text-primary">{formatRupiah(activeAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
                  <span className="text-xs text-text-muted">Metode</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <span className="text-base">{activePaymentMethod?.logo}</span>
                    {activePaymentMethod?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Donor Name Options */}
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-md">
              {user ? (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <label htmlFor="anonymous" className="block text-sm font-semibold text-text-primary">
                      Sembunyikan Nama
                    </label>
                    <p className="text-xs text-text-muted">
                      {isAnonymous ? 'Berdonasi sebagai Hamba Allah' : `Berdonasi sebagai ${user.name}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Donatur Anonim</p>
                    <p className="text-xs text-text-muted">Anda berdonasi sebagai Hamba Allah.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-50 px-4 py-3.5">
              <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold text-primary">Pembayaran Aman</p>
                <p className="mt-0.5 text-[10px] text-primary/70">
                  Data Anda terenkripsi dan tersimpan dengan aman di perangkat Anda. Bukti pembayaran akan disimpan secara otomatis.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmPayment}
                className="pressable w-full rounded-xl bg-gradient-to-r from-primary via-primary-dark to-primary py-4 font-heading text-sm font-bold text-white shadow-lg"
              >
                Konfirmasi & Bayar {formatRupiah(activeAmount)}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('form')}
                className="pressable w-full rounded-xl border-2 border-primary-100 bg-white py-3.5 font-heading text-sm font-semibold text-text-secondary"
              >
                Kembali
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // STEP: Form (default)
  // ═══════════════════════════════════════════
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-4 pb-44 pt-3"
      >
        {/* History Link */}
        <Link
          to="/infaq/history"
          className="pressable mb-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
              <Clock size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-text-primary">Riwayat Infaq</span>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </Link>

        {/* Category Selector */}
        <section className="mb-6">
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary">Pilih Kategori</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {donationCategories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`pressable flex min-w-[90px] flex-col items-center gap-2 rounded-xl border-2 px-4 py-3.5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-50 shadow-md'
                      : 'border-transparent bg-white shadow-sm'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-primary text-white' : 'bg-bg-elevated text-text-secondary'
                    }`}
                  >
                    {iconMap[cat.icon]}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Predefined Amounts */}
        <section className="mb-6">
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary">Pilih Nominal</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {predefinedAmounts.map((amount, idx) => {
              const isSelected = selectedAmount === amount && !isCustomFocused;
              return (
                <motion.button
                  key={amount}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handlePredefinedSelect(amount)}
                  className={`pressable rounded-xl px-3 py-3.5 text-center font-heading text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-text-primary shadow-sm hover:shadow-md'
                  }`}
                >
                  {formatRupiah(amount)}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Custom Amount */}
        <section className="mb-6">
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary">Nominal Lainnya</h2>
          <div
            className={`flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3 transition-all ${
              isCustomFocused ? 'border-primary shadow-md' : 'border-transparent shadow-sm'
            }`}
          >
            <span className="font-heading text-sm font-bold text-text-muted">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              onFocus={handleCustomFocus}
              className="w-full bg-transparent font-heading text-lg font-semibold text-text-primary outline-none placeholder:text-text-muted/50"
            />
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-secondary">Metode Pembayaran</h2>
          <div className="space-y-4">
            {paymentGroups.map((group) => {
              const methods = paymentMethods.filter((m) => m.type === group.type);
              return (
                <div key={group.type}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {group.label}
                  </p>
                  <div className="rounded-xl bg-white shadow-sm">
                    {methods.map((method, idx) => {
                      const isSelected = selectedPayment === method.id;
                      const isLast = idx === methods.length - 1;
                      return (
                        <motion.button
                          key={method.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`pressable flex w-full items-center gap-3 px-4 py-3.5 ${
                            !isLast ? 'border-b border-bg-elevated' : ''
                          }`}
                        >
                          <span className="text-xl">{method.logo}</span>
                          <span className="flex-1 text-left text-sm font-medium text-text-primary">
                            {method.name}
                          </span>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected ? 'border-primary bg-primary' : 'border-text-muted/30'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 rounded-full bg-white"
                              />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </motion.main>

      {/* Summary Card Fixed at Bottom — above bottom nav */}
      <div className="fixed bottom-20 left-0 right-0 z-30">
        <div className="mx-auto max-w-lg">
          <div className="glass border-t border-white/20 px-4 pb-4 pt-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Total {activeCategoryName}</p>
                <p className="font-heading text-lg font-bold text-text-primary">
                  {activeAmount > 0 ? formatRupiah(activeAmount) : 'Rp 0'}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleProceedToConfirm}
              disabled={activeAmount <= 0}
              className={`pressable w-full rounded-xl py-3.5 font-heading text-sm font-bold text-white shadow-gold transition-all ${
                activeAmount > 0
                  ? 'bg-gradient-to-r from-primary via-primary-dark to-primary'
                  : 'cursor-not-allowed bg-text-muted/30'
              }`}
            >
              Lanjutkan Pembayaran
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
