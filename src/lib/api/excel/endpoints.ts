import { DOCUMENT_MANAGER_API_BASE_URL, EXCEL_API_BASE_URL } from "../index";

export const ExcelEndpoints = {
  read: `${EXCEL_API_BASE_URL}/read-excel`,
};

export const DocumentManagerEndpoints = {
  read: `${DOCUMENT_MANAGER_API_BASE_URL}/DocumentManager/excel/import`,
};