import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import ScanQR from "@/components/layout/ScanQR";

type TabType = 'scan qr' | 'tersimpan';

interface CoupounItems {
    id: string;
    code: string;
    description: string;
    coupoun_amount: number;
    valid_until: string;
}

export default function EKupon() {
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('scan qr');

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack={true} />
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-3 pb-24">
        {/* Tab Switcher */}
        <div className="mb-4 flex rounded-xl bg-bg-elevated p-1">
          {(['scan qr', 'tersimpan'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // setSelectedCategoryId(null);
                // setSearchQuery('');
              }}
              className={`pressable relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted'
              }`}
            >
              {tab === 'scan qr' ? 'Scan QR' : 'Tersimpan'}
              {/* {tab === 'tersimpan' && bookmarks.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {bookmarks.length}
                </span>
              )} */}
            </button>
          ))}
        </div>
          {/* QR Code Scanner Placeholder */}
          {/* {activeTab === 'scan qr' && (
            <ScanQR />
          )} */}
          
          <p className="text-lg text-gray-600">Halaman E-Kupon sedang dalam pengembangan.</p>
        </div>
    </div> 

  );
}