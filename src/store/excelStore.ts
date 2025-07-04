import { create } from "zustand";
import { ExcelService } from "@/lib/api/excel/service";
import type { ExcelWorkbook } from "@/lib/api";
import { useAuthStore } from "./authStore";

interface ExcelState {
  workbook: ExcelWorkbook | null;
  loading: boolean;
  setWorkbook: (wb: ExcelWorkbook | null) => void;
  setLoading: (loading: boolean) => void;
  readExcel: (file: File) => Promise<void>;
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
      set({ workbook: res.data });
    } finally {
      set({ loading: false });
    }
  },
}));
