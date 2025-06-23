import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { FakeAPI } from "@/lib/fakeApi";

export default function AuthForm() {
  const { username, setUsername, setStep } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await FakeAPI.sendOtp(username);
      toast.success("OTP sent successfully!");
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleSendOtp} disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </Button>
    </div>
  );
}
