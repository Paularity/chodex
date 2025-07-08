export interface ExcelColumn {
  name: string;
  dataType: string;
  format: string;
  formula: string | null;
}

export interface ExcelSheet {
  sheetName: string;
  columns: ExcelColumn[];
  rows: Array<Array<string | number | null>>;
}

export interface ExcelWorkbook {
  workbookName: string;
  sheets: ExcelSheet[];
}

// API response wrapper for Excel import
export interface ExcelApiDataWrapper {
  id: string;
  applicationId: string;
  tableId: string;
  data: string; // stringified ExcelWorkbook
}

export interface ExcelApiResponse {
  success: boolean;
  error: string | null;
  data: ExcelApiDataWrapper;
  count: number | null;
}
