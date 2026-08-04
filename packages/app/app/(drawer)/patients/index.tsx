import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PatientCard } from "../../../src/components/PatientCard";
import { t } from "../../../src/i18n";
import { colors, radius, cardShadow } from "../../../src/theme";

export default function PatientsList() {
  const router = useRouter();
  const { patients, loading, load, search } = usePatientStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("common.search") + "..."}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/(drawer)/patients/new")}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : patients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("patient.noPatients")}</Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <PatientCard patient={item} onPress={(p) => router.push(`/(drawer)/patients/${p.id}`)} />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", padding: radius.md, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: radius.lg, paddingVertical: 10,
    fontSize: 14, color: colors.text, ...cardShadow,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  addBtnText: { fontSize: 24, color: colors.white, fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: colors.textMuted },
});
