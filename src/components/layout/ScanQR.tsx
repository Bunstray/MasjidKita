import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function ScanQR() {
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
    <>
        <p className="text-lg text-gray-600 mb-4">Arahkan kamera ke QR code untuk memindai.</p>
        <div 
            ref={readerRef}
            id="reader"
        ></div>
    </>
    ); 
}