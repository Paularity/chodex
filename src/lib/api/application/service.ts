import axios from "axios";
import { ApplicationEndpoints } from "./endpoints";
import type { ApiResponse } from "../models/api-response.model";
import type { Application } from "../models/application.model";

export const ApplicationService = {
  list: async (): Promise<ApiResponse<Application[]>> => {
    const response = await axios.get(ApplicationEndpoints.list);
    return response.data;
  },
};
