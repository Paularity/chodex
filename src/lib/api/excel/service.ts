import axios from "axios";
import type { ExcelWorkbook } from "../models/excel-workbook.model";
import { createAuthConfig } from "../helpers";
import { DocumentManagerEndpoints } from "./endpoints";

export const ExcelService = {
  read: async (
    file: File,
    token: string,
    tenantId: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ExcelWorkbook> => {
    const formData = new FormData();
    formData.append("file", file);

    const config = createAuthConfig(token, tenantId);
    const headers = { ...config.headers, "Content-Type": "multipart/form-data" };
    const mergedParams = { saveFile: true, ...(params || {}) };

    const response = await axios.post(DocumentManagerEndpoints.read, formData, { headers, params: mergedParams });
    return response.data;
  },
};

// export const ExcelService = {
//   read: async (
//     file: File,
//     token: string,
//     tenantId: string
//   ): Promise<ExcelWorkbook> => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const config = createAuthConfig(token, tenantId);
//     const headers = { ...config.headers, "Content-Type": "multipart/form-data" };

//     const response = await axios.post(ExcelEndpoints.read, formData, { headers });
//     return response.data;
//   },
// };
