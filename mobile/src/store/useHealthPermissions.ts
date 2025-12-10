import { create } from "zustand";

type HealthPermStore = {
  grantedPermissions: string[];
  setGrantedPermissions: (perms: string[]) => void;
  setupComplete: boolean;
  setSetupComplete: (v: boolean) => void;
};

export const useHealthPermissions = create<HealthPermStore>((set) => ({
  grantedPermissions: [],
  setupComplete: false,

  setGrantedPermissions: (perms) => set({ grantedPermissions: perms }),
  setSetupComplete: (v) => set({ setupComplete: v }),
}));
