import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { AuthService } from "@/lib/api/auth/service";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export default function AuthForm() {
  const { username, setUsername, setStep } = useAuthStore();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message || "Validation failed.";
      setError(firstError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { mfaRegistered } = await AuthService.login(username, password);

      toast.success("Login successful!");
      setStep(mfaRegistered ? 3 : 2);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <img
          src="src/assets/teachrealm-icon.png"
          alt="TeachRealm"
          className="w-10 h-10"
        />
        <h2 className="text-lg font-semibold">Login to Chodex</h2>
      </div>

      {/* Username input */}
      <div className="relative w-full">
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder=" "
          className="peer w-full h-[44px] border border-input rounded-md px-3 pt-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <label
          htmlFor="username"
          className="absolute left-3 top-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-[10px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
        >
          Username
        </label>
      </div>

      {/* Password input */}
      <div className="relative w-full">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="peer w-full h-[44px] border border-input rounded-md px-3 pt-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <label
          htmlFor="password"
          className="absolute left-3 top-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-[10px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
        >
          Password
        </label>
      </div>

      {/* Login button */}
      <Button
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-[44px] flex items-center justify-center gap-2"
      >
        <span>{loading ? "Logging in..." : "Login"}</span>
        <LogIn className="w-4 h-4" />
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
