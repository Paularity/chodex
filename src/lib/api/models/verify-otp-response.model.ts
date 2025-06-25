import type { ApiResponse } from "./api-response.model";

interface VerifyOtpData {
  token: string;
  refresh: string;
}

export type VerifyOtpResponse = ApiResponse<VerifyOtpData>;
