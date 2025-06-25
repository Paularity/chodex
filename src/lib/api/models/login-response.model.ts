import type { ApiResponse } from "./api-response.model";

interface LoginData {
  mfaRegistered: boolean;
  sessionToken: string;
}

export type LoginResponse = ApiResponse<LoginData>;
