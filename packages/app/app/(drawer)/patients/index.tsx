import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PatientCard } from "../../../src/components/PatientCard";
import { t } from "../../../src/i18n";

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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/(drawer)/patients/new")}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 40 }} />
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", padding: 12, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#4A90D9",
    justifyContent: "center", alignItems: "center",
  },
  addBtnText: { fontSize: 24, color: "#fff", fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },
});
