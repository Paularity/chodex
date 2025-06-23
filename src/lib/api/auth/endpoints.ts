import { API_BASE_URL } from "../index";

export const AuthEndpoints = {
  login: `${API_BASE_URL}/auth/login`,
  registerMfa: `${API_BASE_URL}/auth/register-mfa/user`,
  //   verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
};
