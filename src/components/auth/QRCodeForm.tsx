import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QRCodeForm() {
  const { setStep, username, setOtpExpired } = useAuthStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOtpExpired(true);
      toast.warning("OTP has expired. Please try again.");
    }, 30000); // 30 seconds
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-medium">
        Scan this QR Code using Microsoft Authenticator
      </p>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/Chodex:${username}?secret=TEST1234&issuer=Chodex`}
        alt="Authenticator QR"
        className="mx-auto w-40 h-40 border"
      />
      <Button onClick={() => setStep(3)}>I've Scanned the QR Code</Button>
    </div>
  );
}
