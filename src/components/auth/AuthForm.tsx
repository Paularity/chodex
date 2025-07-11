import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
import { AuthService } from "@/lib/api/auth/service";
import { DEFAULT_FAILED_TENANT_ID, DEFAULT_TENANT_ID } from "@/lib/api";
import type { AxiosError } from "axios";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  tenantId: z.string().min(1, "Tenant is required."),
});

export default function AuthForm() {
  const {
    username,
    setUsername,
    setStep,
    setSessionToken,
    tenantId,
    setTenantId,
  } = useAuthStore();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ username, password, tenantId });

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message || "Validation failed.";
      setError(firstError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await AuthService.login(username, password, tenantId);

      // toast.success("Login successful!");
      setStep(data.mfaRegistered ? 3 : 2);
      setSessionToken(data.sessionToken);
    } catch (err) {
      toast.dismiss();

      const error = err as AxiosError<{ error: string }>;
      const message = error.response?.data?.error || "Something went wrong.";
      console.error("Auth Error:", message);
      toast.error(message);
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

      {/* Tenant dropdown */}
      <div className="w-full space-y-3 my-[30px]">
        <label
          htmlFor="tenant"
          className="block text-sm font-medium text-muted-foreground mb-1 text-left"
        >
          Tenant
        </label>

        <Select value={tenantId} onValueChange={setTenantId}>
          <SelectTrigger id="tenant" className="w-full h-[44px] border border-input rounded-md px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select a tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_TENANT_ID}>Test Tenant</SelectItem>
            <SelectItem value={DEFAULT_FAILED_TENANT_ID}>Failed Tenant</SelectItem>
          </SelectContent>
        </Select>
      </div>



      {/* Login button */}
      <Button
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-[44px] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Login
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
