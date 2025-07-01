import type { ApiResponse } from "../models/api-response.model";
import type { FileItem } from "../models/file.model";
import { mockFiles } from "@/mocks/fileItems";

export const FileService = {
  list: async (
    _token: string,
    _tenantId: string
  ): Promise<ApiResponse<FileItem[]>> => {
    return Promise.resolve({
      success: true,
      error: null,
      data: mockFiles as unknown as FileItem[],
      count: mockFiles.length,
    });
  },
};

