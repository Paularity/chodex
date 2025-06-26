import axios from "axios";
import { AuthEndpoints } from "./endpoints";
import type { LoginResponse } from "../models/login-response.model";
import type { RegisterMfaResponse } from "../models/register-mfa-response.model";
import type { VerifyOtpResponse } from "../models/verify-otp-response.model";
export const AuthService = {
  login: async (username: string, password: string, tenantId: string) => {
    const response = await axios.post(AuthEndpoints.login, {
      username,
      password,
      tenantId,
    });
    return response.data as LoginResponse;
  },

  registerMfa: async (sessionToken: string) => {
    const response = await axios.post(AuthEndpoints.registerMfa, {
      sessionToken,
    });
    return response.data as RegisterMfaResponse;
  },

  verifyTotp: async (sessionToken: string, code: string) => {
    const response = await axios.post(AuthEndpoints.verifyOtp, {
      sessionToken,
      code,
    });
    return response.data as VerifyOtpResponse;
  },

  // Future endpoints
  // sendOtp: (username: string) => axios.post(AuthEndpoints.sendOtp, { username }),
  // verifyOtp: (otp: string) => axios.post(AuthEndpoints.verifyOtp, { otp }),
};
