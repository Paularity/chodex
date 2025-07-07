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
