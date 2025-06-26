import { create } from "zustand";
import { DEFAULT_TENANT_ID } from "@/lib/api";

interface AuthState {
  step: number;
  username: string;
  password: string;
  tenantId: string;
  otp: string;
  sessionToken: string;
  isAuthenticated: boolean;
  otpExpired: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setTenantId: (tenantId: string) => void;
  setOtp: (otp: string) => void;
  setSessionToken: (token: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setOtpExpired: (expired: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialState = {
    step: 1,
    username: "",
    password: "",
    tenantId: DEFAULT_TENANT_ID,
    otp: "",
    sessionToken: "",
    isAuthenticated: false,
    otpExpired: false,
  };

  return {
    ...initialState,

    setStep: (step) => set({ step }),
    setUsername: (username) => set({ username }),
    setPassword: (password) => set({ password }),
    setTenantId: (tenantId) => set({ tenantId }),
    setOtp: (otp) => set({ otp }),
    setSessionToken: (token) => set({ sessionToken: token }),
    setAuthenticated: (auth) => set({ isAuthenticated: auth }),
    setOtpExpired: (expired) => set({ otpExpired: expired }),

    reset: () =>
      set({
        ...initialState,
      }),
  };
});
