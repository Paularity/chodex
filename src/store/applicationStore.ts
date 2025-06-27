import { create } from "zustand";
import { ApplicationService } from "@/lib/api/application/service";
import type { Application } from "@/lib/api/models/application.model";
import { useAuthStore } from "./authStore";

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  setApplications: (apps: Application[]) => void;
  fetchApplications: () => Promise<void>;
  refreshApplications: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  setApplications: (apps) => set({ applications: apps }),
  fetchApplications: async () => {
    set({ loading: true });
    try {
      const { token, tenantId } = useAuthStore.getState();
      const res = await ApplicationService.list(token, tenantId);
      set({ applications: res.data });
    } finally {
      set({ loading: false });
    }
  },
  refreshApplications: async () => {
    set({ loading: true });
    try {
      const { token, tenantId } = useAuthStore.getState();
      await ApplicationService.refresh(token, tenantId);
      const res = await ApplicationService.list(token, tenantId);
      set({ applications: res.data });
    } finally {
      set({ loading: false });
    }
  },
}));
