import axios from "axios";
import { AuthEndpoints } from "./endpoints";

export const AuthService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(AuthEndpoints.login, {
      username,
      password,
    });
    return response.data as { mfaRegistered: boolean };
  },

  registerMfa: async (username: string) => {
    const response = await axios.post(AuthEndpoints.registerMfa, {
      username,
    });
    return response.data as {
      secret: string;
      qrCodeImageBase64: string;
    };
  },

  // Future endpoints
  // sendOtp: (username: string) => axios.post(AuthEndpoints.sendOtp, { username }),
  // verifyOtp: (otp: string) => axios.post(AuthEndpoints.verifyOtp, { otp }),
};
