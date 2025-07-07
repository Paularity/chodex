import { create } from "zustand";
import { ExcelService } from "@/lib/api/excel/service";
import type { ExcelWorkbook } from "@/lib/api/models/excel-workbook.model";
import { useAuthStore } from "./authStore";

interface ExcelState {
  workbook: ExcelWorkbook | null;
  loading: boolean;
  setWorkbook: (wb: ExcelWorkbook | null) => void;
  setLoading: (loading: boolean) => void;
  readExcel: (file: File) => Promise<ExcelWorkbook | undefined>;
  renameColumn: (sheetName: string, colIdx: number, newName: string) => void;
}

export const useExcelStore = create<ExcelState>((set) => ({
  workbook: null,
  loading: false,
  setWorkbook: (wb) => set({ workbook: wb }),
  setLoading: (loading) => set({ loading }),
  readExcel: async (file: File) => {
    set({ loading: true });
    try {
      const { token, tenantId } = useAuthStore.getState();
      const res = await ExcelService.read(file, token, tenantId);
      console.log("[excelStore] ExcelService.read response:", res);
      if (res && res.workbookName && res.sheets) {
        set({ workbook: res });
        return res;
      } else {
        set({ workbook: null });
        return undefined;
      }
    } finally {
      set({ loading: false });
    }
  },
  renameColumn: (sheetName: string, colIdx: number, newName: string) => {
    set((state) => {
      if (!state.workbook) return {};
      const updatedSheets = state.workbook.sheets.map((sheet) => {
        if (sheet.sheetName !== sheetName) return sheet;
        const newColumns = sheet.columns.map((col, idx) =>
          idx === colIdx ? { ...col, name: newName } : col
        );
        return { ...sheet, columns: newColumns };
      });
      return { workbook: { ...state.workbook, sheets: updatedSheets } };
    });
  },
}));
