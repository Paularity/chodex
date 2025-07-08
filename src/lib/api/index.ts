// Base API setup
export const API_BASE_URL = "https://localhost:5081/api";
export const APPLICATION_API_BASE_URL = "https://localhost:5091/api";
export const FILE_API_BASE_URL = "https://localhost:5085/api";
export const EXCEL_API_BASE_URL = "http://localhost:5093";
export const DOCUMENT_MANAGER_API_BASE_URL = "https://localhost:5086/api";
export const DEFAULT_TENANT_ID = "11111111-1111-1111-1111-111111111111";
export const DEFAULT_FAILED_TENANT_ID = "11111111-1111-1111-1111-111111111112";
export { createAuthConfig, createAuthHeaders } from "./helpers";
export type { ApplicationSaveRequest } from "./models/application-save-request.model";
export type { FileItem } from "./models/file.model";
export type { ExcelWorkbook } from "./models/excel-workbook.model";
