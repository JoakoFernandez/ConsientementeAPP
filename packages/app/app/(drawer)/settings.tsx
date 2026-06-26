import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSyncStore } from "../../src/stores/syncStore";
import { setLanguage, getLanguage, t, Language } from "../../src/i18n";
import { useState } from "react";

export default function Settings() {
  const { lastSync, syncing, syncNow, getStatus } = useSyncStore();
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => { getStatus(); }, []);

  function changeLanguage(l: Language) {
    setLanguage(l);
    setLang(l);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, lang === "es" && styles.langActive]}
            onPress={() => changeLanguage("es")}
          >
            <Text style={[styles.langText, lang === "es" && styles.langTextActive]}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === "en" && styles.langActive]}
            onPress={() => changeLanguage("en")}
          >
            <Text style={[styles.langText, lang === "en" && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.sync")}</Text>
        <View style={styles.syncRow}>
          <Text style={styles.syncLabel}>
            {t("settings.lastSync")}: {lastSync ? lastSync.toLocaleString() : "Nunca"}
          </Text>
          <TouchableOpacity style={styles.syncBtn} onPress={syncNow} disabled={syncing}>
            <Text style={styles.syncBtnText}>{syncing ? "..." : t("settings.syncNow")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.currency")}</Text>
        <Text style={styles.infoText}>PYG - Guaraníes (Gs.)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
        <Text style={styles.infoText}>Consientemente {t("settings.version")} 1.0.0</Text>
        <Text style={styles.infoText}>App para gestión de consultorio psicológico</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  section: { backgroundColor: "#fff", margin: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },
  langRow: { flexDirection: "row", gap: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: "#f0f0f0", alignItems: "center" },
  langActive: { backgroundColor: "#4A90D9" },
  langText: { fontSize: 14, fontWeight: "600", color: "#666" },
  langTextActive: { color: "#fff" },
  syncRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  syncLabel: { fontSize: 13, color: "#666", flex: 1 },
  syncBtn: { backgroundColor: "#4A90D9", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  syncBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  infoText: { fontSize: 14, color: "#666", marginBottom: 4 },
});
