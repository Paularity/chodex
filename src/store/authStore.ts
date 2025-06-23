import { create } from "zustand";

interface AuthState {
  step: number;
  username: string;
  otp: string;
  isAuthenticated: boolean;
  otpExpired: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setOtp: (otp: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setOtpExpired: (expired: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  step: 1, // 1 = username, 2 = qr, 3 = otp
  username: "",
  otp: "",
  isAuthenticated: false,
  otpExpired: false,
  setOtpExpired: (expired: boolean) => set({ otpExpired: expired }),
  setStep: (step) => set({ step }),
  setUsername: (username) => set({ username }),
  setOtp: (otp) => set({ otp }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));
