import { Alert, Linking } from "react-native";
import { getGrantedPermissions, Permission } from "react-native-health-connect";

const sleepPermission: Permission = {
  accessType: "read",
  recordType: "SleepSession",
};

export async function ensureSleepPermission(): Promise<boolean> {
  const grantedList = await getGrantedPermissions();

  const granted = grantedList.some(
    (p) => p.recordType === sleepPermission.recordType
  );

  if (granted) return true;

  // Prompt user
  Alert.alert(
    "Sleep Permission Required",
    "Sleep data permission was revoked. Please re-enable it in Health Connect.",
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
