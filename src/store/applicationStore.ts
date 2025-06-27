import { create } from "zustand";
import { ApplicationService } from "@/lib/api/application/service";
import type { Application } from "@/lib/api/models/application.model";

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  setApplications: (apps: Application[]) => void;
  fetchApplications: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  setApplications: (apps) => set({ applications: apps }),
  fetchApplications: async () => {
    set({ loading: true });
    try {
      const res = await ApplicationService.list();
      set({ applications: res.data });
    } finally {
      set({ loading: false });
    }
  },
}));
