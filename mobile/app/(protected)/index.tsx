import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ExerciseCard from "../../components/home/ExerciseCard";
import HeartRateCard from "../../components/home/HeartRateCard";
import SleepCard from "../../components/home/SleepCard";
import StepsCard from "../../components/home/StepsCard";
import SyncButton from "../../components/home/SyncButton";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();
  const handleSync = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 25 },
      ]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleSync} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={styles.header}>Your Health Summary</Text>

        <SleepCard />
        <ExerciseCard />
        <HeartRateCard />
        <StepsCard />
        <SyncButton onSync={handleSync} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },
});
