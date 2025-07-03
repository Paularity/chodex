import axios from "axios";
import type { ApiResponse } from "../models/api-response.model";
import type { FileItem } from "../models/file.model";
import { FileEndpoints } from "./endpoints";
import { createAuthConfig } from "../helpers";

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

  create: async (
    data: Omit<FileItem, "id">,
    token: string,
    tenantId: string
  ): Promise<ApiResponse<FileItem>> => {
    const response = await axios.post(
      FileEndpoints.create,
      data,
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },
};

