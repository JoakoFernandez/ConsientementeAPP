import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { useSyncStore } from "../../src/stores/syncStore";
import { useSettingsStore, Currency } from "../../src/stores/settingsStore";
import { useClinicStore } from "../../src/stores/clinicStore";
import { setLanguage, getLanguage, t, Language } from "../../src/i18n";
import { useState } from "react";
import { colors, radius, cardShadow } from "../../src/theme";

export default function Settings() {
  const { lastSync, syncing, syncNow, getStatus } = useSyncStore();
  const { currency, setCurrency } = useSettingsStore();
  const { profile, save } = useClinicStore();
  const [lang, setLang] = useState<Language>(getLanguage());
  const [clinicName, setClinicName] = useState(profile?.clinicName ?? "");
  const [psychologistName, setPsychologistName] = useState(profile?.psychologistName ?? "");

  useEffect(() => { getStatus(); }, []);
  useEffect(() => {
    if (profile) {
      setClinicName(profile.clinicName);
      setPsychologistName(profile.psychologistName);
    }
  }, [profile]);

  async function handleSaveClinic() {
    await save({ clinicName, psychologistName });
  }

  function changeLanguage(l: Language) {
    setLanguage(l);
    setLang(l);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.clinic")}</Text>
        <Text style={styles.label}>{t("settings.clinicName")}</Text>
        <TextInput
          style={styles.input}
          value={clinicName}
          onChangeText={setClinicName}
          placeholder="Centro de Psicología Paz"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>{t("settings.psychologistName")}</Text>
        <TextInput
          style={styles.input}
          value={psychologistName}
          onChangeText={setPsychologistName}
          placeholder="Lic. María González"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveClinic}>
          <Text style={styles.saveBtnText}>{t("common.save")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, lang === "es" && styles.langActive]}
            onPress={() => changeLanguage("es")}
          >
            <Text style={[styles.langText, lang === "es" && styles.langTextActive]}>{t("settings.spanish")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === "en" && styles.langActive]}
            onPress={() => changeLanguage("en")}
          >
            <Text style={[styles.langText, lang === "en" && styles.langTextActive]}>{t("settings.english")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === "it" && styles.langActive]}
            onPress={() => changeLanguage("it")}
          >
            <Text style={[styles.langText, lang === "it" && styles.langTextActive]}>{t("settings.italian")}</Text>
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
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, currency === "PYG" && styles.langActive]}
            onPress={() => setCurrency("PYG")}
          >
            <Text style={[styles.langText, currency === "PYG" && styles.langTextActive]}>Guaraníes (Gs.)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, currency === "USD" && styles.langActive]}
            onPress={() => setCurrency("USD")}
          >
            <Text style={[styles.langText, currency === "USD" && styles.langTextActive]}>Dólares ($)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
        <Text style={styles.infoText}>Consientemente {t("settings.version")} 1.0.0</Text>
        <Text style={styles.infoText}>{t("settings.aboutText")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { backgroundColor: colors.surface, margin: radius.md, borderRadius: radius.md, padding: radius.lg, ...cardShadow },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: radius.md },
  langRow: { flexDirection: "row", gap: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: "center" },
  langActive: { backgroundColor: colors.primary },
  langText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  langTextActive: { color: colors.white },
  syncRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  syncLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  syncBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 8 },
  syncBtnText: { color: colors.white, fontWeight: "600", fontSize: 13 },
  infoText: { fontSize: 14, color: colors.text, marginBottom: 4 },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: 8, marginBottom: 4, fontWeight: "600" },
  input: {
    backgroundColor: colors.surfaceSoft, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center", marginTop: 12,
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});
