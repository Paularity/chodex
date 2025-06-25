import type { ApiResponse } from "./api-response.model";

interface RegisterMfaData {
  secret: string;
  qrCodeImageBase64: string;
}

export type RegisterMfaResponse = ApiResponse<RegisterMfaData>;
