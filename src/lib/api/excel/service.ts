import axios from "axios";
import type { ExcelWorkbook } from "../models/excel-workbook.model";
import { ExcelEndpoints } from "./endpoints";
import { createAuthConfig } from "../helpers";

export const ExcelService = {
  read: async (
    file: File,
    token: string,
    tenantId: string
  ): Promise<ExcelWorkbook> => {
    const formData = new FormData();
    formData.append("file", file);

    const config = createAuthConfig(token, tenantId);
    const headers = { ...config.headers, "Content-Type": "multipart/form-data" };

    const response = await axios.post(ExcelEndpoints.read, formData, { headers });
    return response.data;
  },
};
