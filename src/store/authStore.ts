import { create } from "zustand";

interface AuthState {
  step: number;
  username: string;
  password: string;
  otp: string;
  sessionToken: string;
  isAuthenticated: boolean;
  otpExpired: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setOtp: (otp: string) => void;
  setSessionToken: (token: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setOtpExpired: (expired: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  step: 1,
  username: "",
  password: "",
  otp: "",
  sessionToken: "",
  isAuthenticated: false,
  otpExpired: false,
  setStep: (step) => set({ step }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setOtp: (otp) => set({ otp }),
  setSessionToken: (token) => set({ sessionToken: token }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setOtpExpired: (expired) => set({ otpExpired: expired }),
}));
