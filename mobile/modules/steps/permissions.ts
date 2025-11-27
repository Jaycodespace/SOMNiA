import { Alert, Linking } from "react-native";
import { getGrantedPermissions, Permission } from "react-native-health-connect";

const stepsPermission: Permission = {
  accessType: "read",
  recordType: "Steps",
};

export async function ensureStepsPermission(): Promise<boolean> {
  const grantedList = await getGrantedPermissions();

  const granted = grantedList.some(
    (p) => p.recordType === stepsPermission.recordType
  );

  if (granted) return true;

  Alert.alert(
    "Steps Permission Required",
    "Steps data permission was revoked. Please re-enable it in Health Connect.",
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
