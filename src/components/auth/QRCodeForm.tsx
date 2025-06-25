import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, User } from "lucide-react";
import { AuthService } from "@/lib/api/auth/service";

export default function QRCodeForm() {
  const { setStep, sessionToken, setOtpExpired, setUsername, setPassword } =
    useAuthStore();

  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOtpExpired(true);
      toast.warning("OTP has expired. Please try again.");
    }, 30000);

    return () => clearTimeout(timeout);
  }, [setOtpExpired]);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const res = await AuthService.registerMfa(sessionToken);
        setQrCodeBase64(res.data?.qrCodeImageBase64);
      } catch (error) {
        console.error("QR Code generation failed:", error);
        toast.error("Failed to generate QR code. Please try again.");
      }
    };

    fetchQRCode();
  }, [sessionToken]);

  const handleSwitchAccount = () => {
    setUsername("");
    setPassword("");
    setStep(1);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center gap-2 text-lg font-semibold">
        <QrCode className="w-5 h-5" />
        Scan with Authenticator
      </div>

      {qrCodeBase64 ? (
        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="Authenticator QR"
          className="mx-auto w-40 h-40 border"
        />
      ) : (
        <p className="text-muted-foreground text-sm">Loading QR Code...</p>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={() => setStep(3)}>I've Scanned the QR Code</Button>
        <Button
          variant="ghost"
          onClick={handleSwitchAccount}
          className="text-xs text-muted-foreground"
        >
          <User className="w-3.5 h-3.5 mr-1" />
          Use a different account
        </Button>
      </div>
    </div>
  );
}
