import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { AuthService } from "@/lib/api/auth/service";
import { DEFAULT_TENANT_ID } from "@/lib/api";
import type { AxiosError } from "axios";
import { useState } from "react";

export default function OTPForm() {
  const [verifying, setVerifying] = useState(false);

  const {
    otp,
    sessionToken,
    setOtp,
    setAuthenticated,
    otpExpired,
    setStep,
    setUsername,
    setOtpExpired,
    setTenantId,
    tenantId,
  } = useAuthStore();

  const handleVerify = async () => {
    if (otp.length < 6) return;

    setVerifying(true);

    try {
      const response = await AuthService.verifyTotp(
        sessionToken,
        otp,
        tenantId
      );

      if (!response.success || !response.data?.token) {
        toast.error("Invalid OTP or verification failed.");
        return;
      }

      setAuthenticated(true);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      const message = error.response?.data?.error || "Something went wrong.";
      console.error("OTP Error:", message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSwitchAccount = () => {
    setOtp("");
    setUsername("");
    setTenantId(DEFAULT_TENANT_ID);
    setOtpExpired(false);
    setStep(1);
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-semibold">Enter the 6-digit OTP</p>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={otpExpired}
          name="otp"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleVerify}
          disabled={otp.length < 6 || otpExpired || verifying}
          className="flex items-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Verify OTP
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={handleSwitchAccount}
          className="text-xs text-muted-foreground mx-auto"
        >
          <User className="w-3.5 h-3.5 mr-1" />
          Use a different account
        </Button>
      </div>
    </div>
  );
}
