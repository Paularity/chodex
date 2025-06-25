import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { CheckCircle, User } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { AuthService } from "@/lib/api/auth/service";
import type { AxiosError } from "axios";

      const error = err as AxiosError<{ error: string }>;
      const message = error.response?.data?.error || "Something went wrong.";

      console.error("OTP Error:", message);
      toast.error(message);
export default function OTPForm() {
  const {
    otp,
    sessionToken,
    setOtp,
    setAuthenticated,
    otpExpired,
    setStep,
    setUsername,
    setOtpExpired,
  } = useAuthStore();

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit OTP.");
      return;
    }

    try {
      toast.loading("Verifying...");

      const response = await AuthService.verifyTotp(sessionToken, otp);

      toast.dismiss();

      if (!response.success || !response.data?.token) {
        toast.error("Invalid OTP or verification failed.");
        return;
      }

      // You can optionally store the token here
      // localStorage.setItem("token", response.data.token);

      toast.success("OTP verified!");
      setAuthenticated(true);
    } catch (err) {
      toast.dismiss();

      const error = err as AxiosError<{ error: string }>;
      const message = error.response?.data?.error || "Something went wrong.";

      console.error("OTP Error:", message);
      toast.error(message);
    }
  };

  const handleSwitchAccount = () => {
    setOtp("");
    setUsername("");
    setOtpExpired(false); // ✅ Reset OTP expiration
    setStep(1); // Back to username/password form
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
          disabled={otp.length < 6 || otpExpired}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Verify OTP
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
