import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import { create } from "zustand";

type HealthState = {
  sdkStatus: number | null;
  isInitialized: boolean;
  isChecking: boolean;
  checkHealthConnect: (silent?: boolean) => Promise<void>;
  hasPermission: (recordType: string) => Promise<boolean>;
};

export const useHealthStore = create<HealthState>((set) => ({
  sdkStatus: null,
  isInitialized: false,
  isChecking: true,

  checkHealthConnect: async (silent = false) => {
    if (!silent) set({ isChecking: true });
    try {
      const status = await getSdkStatus();
      if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
        const initialized = await initialize();
        set({ sdkStatus: status, isInitialized: initialized });
      } else {
        set({ sdkStatus: status, isInitialized: false });
      }
    } catch (err) {
      console.error("Error checking Health Connect:", err);
      set({
        sdkStatus: SdkAvailabilityStatus.SDK_UNAVAILABLE,
        isInitialized: false,
      });
    } finally {
      set({ isChecking: false });
    }
  },

  hasPermission: async (recordType: string) => {
    try {
      const granted = await getGrantedPermissions();
      return granted.some((p) => p.recordType === recordType);
    } catch (err) {
      console.error("Permission check failed:", err);
      return false;
    }
  },
}));
