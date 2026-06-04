import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { motion } from 'framer-motion';

interface CoupounItems {
    id: string;
    code: string;
    description: string;
    coupoun_amount: number;
    valid_until: string;
}

export default function AdminEKupon() {
    const [showForm, setShowForm] = useState(false);
    const [coupouns, setCoupouns] = useState<CoupounItems[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Coupoun Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [validUntil, setValidUntil] = useState('');

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
          <h2 className="font-heading text-2xl font-bold text-text-primary">E-Kupon</h2>
          <p className="text-sm text-text-muted">Kelola E-Kupon anda disini</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          {showForm ? 'Batal' : 'Buat E-Kupon'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <form /*onSubmit={handleSubmit}*/ className="rounded-2xl bg-white p-5 shadow-sm border border-bg-elevated space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Deskripsi Kupon</label>
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
                <label className="text-xs font-semibold text-text-secondary">Jumlah</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-text-secondary">Berlaku hingga</label>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan E-Kupon'}
            </button>
          </form>
        </motion.div>
      )}

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-bg-elevated">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-primary-50">
                <FileText size={40} className="text-primary/20" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {item.category}
                </span>
                <span className="text-[10px] text-text-muted">{formatDate(item.created_at)}</span>
              </div>
              <h3 className="font-heading font-bold text-text-primary line-clamp-2">{item.title}</h3>
              <p className="mt-1 text-xs text-text-secondary line-clamp-3 flex-1">{item.content}</p>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-[10px] text-text-muted">Oleh: {item.author_name}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="pressable rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                  title="Hapus berita"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div> */}
        <div className="flex flex-col items-center justify-center">
            <p className="text-lg text-gray-600 ">Halaman E-Kupon sedang dalam pengembangan.</p>
        </div>
    </div> 

    )
}