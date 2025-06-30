import { create } from "zustand";
import { FileService } from "@/lib/api/file/service";
import type { FileItem } from "@/lib/api/models/file.model";
import { useAuthStore } from "./authStore";

interface FileState {
  files: FileItem[];
  loading: boolean;
  setFiles: (files: FileItem[]) => void;
  setLoading: (loading: boolean) => void;
  fetchFiles: () => Promise<void>;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  loading: false,
  setFiles: (files) => set({ files }),
  setLoading: (loading) => set({ loading }),
  fetchFiles: async () => {
    set({ loading: true });
    try {
      const { token, tenantId } = useAuthStore.getState();
      const res = await FileService.list(token, tenantId);
      set({ files: res.data });
    } finally {
      set({ loading: false });
    }
  },
}));

