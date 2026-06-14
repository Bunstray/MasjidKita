import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface GenerateQRProps {
  data: string;
  size?: number;
}

export default function GenerateQR({ data, size = 300 }: GenerateQRProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        setQrImage(url);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };
    generate();
  }, [data, size]);

  if (!qrImage) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <img src={qrImage} alt={`QR Code: ${data}`} className="rounded-lg" style={{ width: size, height: size }} />
    </div>
  );
}