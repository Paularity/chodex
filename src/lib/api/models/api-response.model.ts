export interface ApiResponse<T> {
  success: boolean;
  error: string | null;
  data: T;
  count: number | null;
}
