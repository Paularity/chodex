import { FILE_API_BASE_URL } from "../index";

export const FileEndpoints = {
  list: `${FILE_API_BASE_URL}/file?page=1&pageSize=999999`,
  create: `${FILE_API_BASE_URL}/file`,
};

