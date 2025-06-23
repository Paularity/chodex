import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, User } from "lucide-react";

export default function QRCodeForm() {
  const { setStep, username, setOtpExpired, setUsername, setPassword } =
    useAuthStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOtpExpired(true);
      toast.warning("OTP has expired. Please try again.");
    }, 30000);
    return () => clearTimeout(timeout);
  }, [setOtpExpired]);

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

      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/Chodex:${username}?secret=TEST1234&issuer=Chodex`}
        alt="Authenticator QR"
        className="mx-auto w-40 h-40 border"
      />

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
