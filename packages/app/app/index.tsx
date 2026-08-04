import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useClinicStore } from "../src/stores/clinicStore";
import { colors } from "../src/theme";

export default function Index() {
  const { profile, loading, load } = useClinicStore();

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) return <Redirect href="/setup" />;
  return <Redirect href="/(drawer)/dashboard" />;
}