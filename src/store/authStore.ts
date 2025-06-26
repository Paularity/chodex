import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TENANT_ID } from "@/lib/api";

interface AuthState {
  step: number;
  username: string;
  password: string;
  tenantId: string;
  otp: string;
  sessionToken: string;
  token: string;
  user: string;
  isAuthenticated: boolean;
  otpExpired: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setTenantId: (tenantId: string) => void;
  setOtp: (otp: string) => void;
  setSessionToken: (token: string) => void;
  setToken: (token: string) => void;
  setUser: (user: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setOtpExpired: (expired: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      const initialState = {
        step: 1,
        username: "",
        password: "",
        tenantId: DEFAULT_TENANT_ID,
        otp: "",
        sessionToken: "",
        token: "",
        user: "",
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
        setToken: (token) => set({ token }),
        setUser: (user) => set({ user }),
        setAuthenticated: (auth) => set({ isAuthenticated: auth }),
        setOtpExpired: (expired) => set({ otpExpired: expired }),

        logout: () => {
          set({ ...initialState });
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
          }
        },

        reset: () =>
          set({
            ...initialState,
          }),
      };
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
