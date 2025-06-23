import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { FakeAPI } from "@/lib/fakeApi";

export default function OTPForm() {
  const { otp, setOtp, setAuthenticated, otpExpired } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await FakeAPI.verifyOtp(otp);
      toast.success("OTP verified. Welcome!");
      setAuthenticated(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        disabled={otpExpired}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleVerifyOtp} disabled={loading || otpExpired}>
        {otpExpired ? "OTP Expired" : loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
}
