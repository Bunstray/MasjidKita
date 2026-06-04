import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function GenerateQR() {
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const data = "https://masjidkita.com/ekupon/12345"; // Example data
        const qrCodeDataUrl = await QRCode.toDataURL(data);
        setQrData(qrCodeDataUrl);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };

    generateQR();
  }, []);

  if (!qrData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <img src={qrData} alt="Generated QR Code" className="h-full w-full" />
    </div>
  );
}