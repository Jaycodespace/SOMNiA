import { Alert, Linking } from "react-native";
import { getGrantedPermissions, Permission } from "react-native-health-connect";

const spo2Permission: Permission = {
  accessType: "read",
  recordType: "OxygenSaturation",
};

export async function ensureSpO2Permission(): Promise<boolean> {
  const granted = await getGrantedPermissions();
  const hasPermission = granted.some(
    (p) => p.recordType === spo2Permission.recordType
  );

  if (hasPermission) return true;

  Alert.alert(
    "Permission Required",
    "SpO₂ permission is not enabled. Please allow access in Health Connect.",
    [
      {
        text: "Open Health Connect",
        onPress: () =>
          Linking.openURL("package:com.google.android.apps.healthdata"),
      },
      { text: "Cancel", style: "cancel" },
    ]
  );

  return false;
}
