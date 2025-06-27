import axios from "axios";
import { ApplicationEndpoints } from "./endpoints";
import { createAuthConfig } from "../helpers";
import type { ApiResponse } from "../models/api-response.model";
import type { Application } from "../models/application.model";
import type { ApplicationCreateRequest } from "../models/application-create-request.model";

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

  create: async (
    data: ApplicationCreateRequest,
    token: string,
    tenantId: string
  ): Promise<ApiResponse<Application>> => {
    const response = await axios.post(
      ApplicationEndpoints.create,
      data,
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },

  refresh: async (
    token: string,
    tenantId: string
  ): Promise<ApiResponse<null>> => {
    const response = await axios.post(
      ApplicationEndpoints.refresh,
      undefined,
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },

  delete: async (
    id: string,
    token: string,
    tenantId: string
  ): Promise<ApiResponse<null>> => {
    const response = await axios.delete(
      ApplicationEndpoints.delete(id),
      createAuthConfig(token, tenantId)
    );
    return response.data;
  },
};
