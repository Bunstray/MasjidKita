import { useState } from "react";
import { Edit, Loader2, Plus, QrCode, Ticket, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import GenerateQR from "@/components/layout/GenerateQR";

interface CoupounItems {
  id: string;
  code: string;
  description: string;
  coupoun_amount: number;
  valid_until: string;
}

export default function AdminEKupon() {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [coupouns, setCoupouns] = useState<CoupounItems[]>([
    {
      id: "1",
      code: "JUMATBERKAH01",
      description: "Jumat Berkah ",
      coupoun_amount: 2000,
      valid_until: "2026-06-06T14:00",
    },
    {
      id: "2",
      code: "JUMATBERKAH02",
      description: "Jumat Berkah ",
      coupoun_amount: 1500,
      valid_until: "2026-06-13T14:00",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Coupoun Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [validUntil, setValidUntil] = useState("");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            E-Kupon
          </h2>
          <p className="text-sm text-text-muted">Kelola E-Kupon anda disini</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          {showForm ? "Batal" : "Buat E-Kupon"}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <form
            /*onSubmit={handleSubmit}*/ className="rounded-2xl bg-white p-5 shadow-sm border border-bg-elevated space-y-4"
          >
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Deskripsi Kupon
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Jumat Berkah"
                className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Berlaku hingga
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-bg-primary py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="pressable w-full rounded-xl bg-primary py-3 font-heading text-sm font-bold text-white transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan E-Kupon"}
            </button>
          </form>
        </motion.div>
      )}

      {/* List of e-coupouns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupouns.map((item) => (
          <div
            key={item.id}
            className="flex justify-between rounded-2xl bg-white shadow-sm border border-bg-elevated p-4 md:flex-col"
          >
            <div className="mb-3 flex flex-col justify-center rounded-xl">
              <Ticket size={40} className="mb-3 text-primary" />
              <h3 className="font-heading font-bold text-text-primary">
                {item.description}
              </h3>
              <p className="text-sm text-text-secondary">
                Jumlah: {item.coupoun_amount}
              </p>
              <p className="text-sm text-text-secondary">
                Berlaku hingga: {new Date(item.valid_until).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="pressable rounded bg-yellow-50 p-1.5 text-yellow-600 hover:bg-yellow-100 transition-colors"
                  title="Edit kupon"
                >
                  <Edit size={20} />
                </button>
                <button
                  className="pressable rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                  title="Hapus kupon"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setQrData(item.code);
                setShowQR(true);
              }}
              className="pressable rounded-xl bg-primary font-heading text-sm font-bold text-white transition-opacity disabled:opacity-50"
              title="Generate QR Code"
            >
              <div className="flex flex-col items-center justify-center px-4 py-2">
                <QrCode size={40} />
                Generate <br></br> QR Code
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600 ">
          Halaman E-Kupon sedang dalam pengembangan.
        </p>
      </div>

      {showQR && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-4">
            <div className="flex justify-end items-center mb-3">
              <button
                onClick={() => setShowQR(false)}
                className="rounded p-1 text-sm text-text-secondary"
                aria-label="Close QR dialog"
              >
                <X size={18} />
              </button>
            </div>
            <GenerateQR />
            <p className="mt-3 text-center text-sm text-text-secondary">{qrData}</p>
          </div>
        </div>
      )}


    </div>
  );
}
