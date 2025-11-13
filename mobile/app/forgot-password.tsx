import { useStoreAuth } from "@/store/authStore";
import { Button, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
export default function ForgotPasswordScreen() {
  const { backToSignIn } = useStoreAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View>
        <Text>Forgot Password Screen</Text>
        <Button title="Back to Sign In" onPress={backToSignIn} />
      </View>
    </SafeAreaView>
  )
}