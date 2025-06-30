import { create } from "zustand";
import { ApplicationService } from "@/lib/api/application/service";
import type { Application } from "@/lib/api/models/application.model";
import type { ApplicationSaveRequest } from "@/lib/api";
import { useAuthStore } from "./authStore";

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  setApplications: (apps: Application[]) => void;
  setLoading: (loading: boolean) => void;
  fetchApplications: () => Promise<void>;
  createApplication: (app: ApplicationSaveRequest) => Promise<void>;
  updateApplication: (app: ApplicationSaveRequest) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  setApplications: (apps) => set({ applications: apps }),
  setLoading: (loading) => set({ loading }),
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
  createApplication: async (app: ApplicationSaveRequest) => {
    const { token, tenantId } = useAuthStore.getState();
    await ApplicationService.create(app, token, tenantId);
    await useApplicationStore.getState().fetchApplications();
  },
  updateApplication: async (app: ApplicationSaveRequest) => {
    const { token, tenantId } = useAuthStore.getState();
    await ApplicationService.update(app.id, app, token, tenantId);
    await useApplicationStore.getState().fetchApplications();
  },
  deleteApplication: async (id: string) => {
    const { token, tenantId } = useAuthStore.getState();
    await ApplicationService.delete(id, token, tenantId);
    await useApplicationStore.getState().fetchApplications();
  },
}));
