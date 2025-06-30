import { APPLICATION_API_BASE_URL } from "../index";

export const ApplicationEndpoints = {
  list: `${APPLICATION_API_BASE_URL}/application`,
  create: `${APPLICATION_API_BASE_URL}/application`,
  update: (id: string) => `${APPLICATION_API_BASE_URL}/application/${id}`,
  refresh: `${APPLICATION_API_BASE_URL}/application/refresh`,
  delete: (id: string) => `${APPLICATION_API_BASE_URL}/application/${id}`,
};
