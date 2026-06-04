import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import Header from "@/components/layout/Header";

export default function EKupon() {
  const readerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!readerRef.current) return;
  
    const html5QrcodeScanner = new Html5QrcodeScanner(
      readerRef.current.id,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
  
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.warn("Failed to clear QR scanner", error);
      });
    };
  }, []);
  
  function onScanSuccess(decodedText: string, decodedResult: any) {
    console.log(`Code matched = ${decodedText}`, decodedResult);
  }
  
  function onScanFailure(error: any) {
    console.warn(`Code scan error = ${error}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header showBack={true} />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">E-Kupon</h1>
        <p className="text-lg text-gray-600">Halaman E-Kupon sedang dalam pengembangan.</p>
        <button 
          onClick={() => window.history.back()} 
          className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          Kembali
        </button>

        {/* QR Code Scanner Placeholder */}
        <div
          ref={readerRef}
          id="reader"
        ></div>
      </div>
    </div> 

  );
}