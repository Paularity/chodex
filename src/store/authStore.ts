import { create } from "zustand";

interface AuthState {
  step: number; // 1 = login, 2 = otp
  username: string;
  password: string;
  otp: string;
  isAuthenticated: boolean;
  otpExpired: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setOtp: (otp: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setOtpExpired: (expired: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  step: 1,
  username: "",
  password: "",
  otp: "",
  isAuthenticated: false,
  otpExpired: false,
  setStep: (step) => set({ step }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setOtp: (otp) => set({ otp }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setOtpExpired: (expired) => set({ otpExpired: expired }),
}));
