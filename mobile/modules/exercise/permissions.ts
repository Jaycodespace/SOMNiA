import { Alert, Linking } from "react-native";
import { getGrantedPermissions, Permission } from "react-native-health-connect";

const exercisePermission: Permission = {
  accessType: "read",
  recordType: "ExerciseSession",
};

export async function ensureExercisePermission(): Promise<boolean> {
  const grantedList = await getGrantedPermissions();

  const granted = grantedList.some(
    (p) => p.recordType === exercisePermission.recordType
  );

  if (granted) return true;

  Alert.alert(
    "Exercise Permission Required",
    "Exercise session permission was revoked. Please re-enable it in Health Connect.",
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
