import { Alert, Linking } from "react-native";
import { getGrantedPermissions, Permission } from "react-native-health-connect";

const hrPermissions: Permission[] = [
  { accessType: "read", recordType: "HeartRate" },
  { accessType: "read", recordType: "RestingHeartRate" },
];

export async function ensureHeartPermission(): Promise<boolean> {
  const granted = await getGrantedPermissions();

  const hasAll = hrPermissions.every((req) =>
    granted.some((p) => p.recordType === req.recordType)
  );

  if (hasAll) return true;

  Alert.alert(
    "Heart Rate Permission Required",
    "Heart rate permissions were revoked. Please re-enable them in Health Connect.",
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
