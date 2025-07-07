import { create } from "zustand";
import { ExcelService } from "@/lib/api/excel/service";
import type { ExcelWorkbook } from "@/lib/api/models/excel-workbook.model";
import { useAuthStore } from "./authStore";

interface ExcelState {
  workbook: ExcelWorkbook | null;
  loading: boolean;
  activeSheet: string | null;
  editMode: boolean;
  renameDialogOpen: boolean;
  renameSheet: string | null;
  renameColIdx: number | null;
  renameCurrent: string;
  renameValue: string;
  columnDropdowns: Record<string, Record<number, boolean>>; // sheetName -> colIdx -> isDropdown
  setWorkbook: (wb: ExcelWorkbook | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveSheet: (sheet: string | null) => void;
  setEditMode: (edit: boolean) => void;
  setRenameDialogOpen: (open: boolean) => void;
  setRenameSheet: (sheet: string | null) => void;
  setRenameColIdx: (idx: number | null) => void;
  setRenameCurrent: (val: string) => void;
  setRenameValue: (val: string) => void;
  setColumnDropdown: (sheet: string, colIdx: number, isDropdown: boolean) => void;
  readExcel: (file: File) => Promise<ExcelWorkbook | undefined>;
  renameColumn: (sheetName: string, colIdx: number, newName: string) => void;
  customDropdownValues: Record<string, Record<number, string[]>>; // sheetName -> colIdx -> custom values
  setCustomDropdownValues: (sheet: string, colIdx: number, values: string[]) => void;
}

export const useExcelStore = create<ExcelState>((set, get) => ({
  workbook: null,
  loading: false,
  activeSheet: null,
  editMode: false,
  renameDialogOpen: false,
  renameSheet: null,
  renameColIdx: null,
  renameCurrent: "",
  renameValue: "",
  columnDropdowns: {},
  customDropdownValues: {},
  setWorkbook: (wb) => set({ workbook: wb }),
  setLoading: (loading) => set({ loading }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  setEditMode: (edit) => set({ editMode: edit }),
  setRenameDialogOpen: (open) => set({ renameDialogOpen: open }),
  setRenameSheet: (sheet) => set({ renameSheet: sheet }),
  setRenameColIdx: (idx) => set({ renameColIdx: idx }),
  setRenameCurrent: (val) => set({ renameCurrent: val }),
  setRenameValue: (val) => set({ renameValue: val }),
  setColumnDropdown: (sheet, colIdx, isDropdown) => {
    set((state) => {
      const prev = state.columnDropdowns[sheet] || {};
      return {
        columnDropdowns: {
          ...state.columnDropdowns,
          [sheet]: { ...prev, [colIdx]: isDropdown },
        },
      };
    });
  },
  setCustomDropdownValues: (sheet, colIdx, values) => {
    set((state) => {
      const prev = state.customDropdownValues[sheet] || {};
      return {
        customDropdownValues: {
          ...state.customDropdownValues,
          [sheet]: { ...prev, [colIdx]: values },
        },
      };
    });
  },
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
