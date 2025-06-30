import axios from "axios";
import { FileEndpoints } from "./endpoints";
import { createAuthConfig } from "../helpers";
import type { ApiResponse } from "../models/api-response.model";
import type { FileItem } from "../models/file.model";

export const FileService = {
  list: async (
    token: string,
    tenantId: string
  ): Promise<ApiResponse<FileItem[]>> => {
    const response = await axios.get(
      FileEndpoints.list,
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },
};

