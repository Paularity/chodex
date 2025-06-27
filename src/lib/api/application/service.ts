import axios from "axios";
import { ApplicationEndpoints } from "./endpoints";
import { createAuthConfig } from "../helpers";
import type { ApiResponse } from "../models/api-response.model";
import type { Application } from "../models/application.model";

export const ApplicationService = {
  list: async (
    token: string,
    tenantId: string
  ): Promise<ApiResponse<Application[]>> => {
    const response = await axios.get(
      ApplicationEndpoints.list,
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },
};
