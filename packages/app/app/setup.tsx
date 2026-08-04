import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useClinicStore } from "../src/stores/clinicStore";
import { t } from "../src/i18n";
import { colors, radius, cardShadow } from "../src/theme";

export default function Setup() {
  const router = useRouter();
  const { save } = useClinicStore();
  const [clinicName, setClinicName] = useState("");
  const [psychologistName, setPsychologistName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (!clinicName.trim()) {
      Alert.alert("", t("setup.required"));
      return;
    }
    setSaving(true);
    await save({ clinicName, psychologistName });
    router.replace("/(drawer)/dashboard");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.title}>{t("setup.title")}</Text>
        <Text style={styles.subtitle}>{t("setup.subtitle")}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t("setup.clinicName")} *</Text>
        <TextInput
          style={styles.input}
          value={clinicName}
          onChangeText={setClinicName}
          placeholder={t("setup.clinicNamePlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>{t("setup.psychologistName")}</Text>
        <TextInput
          style={styles.input}
          value={psychologistName}
          onChangeText={setPsychologistName}
          placeholder={t("setup.psychologistPlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} disabled={saving} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>{saving ? "..." : t("setup.start")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: radius.xl, justifyContent: "center", flexGrow: 1 },
  hero: { alignItems: "center", marginBottom: radius.xl },
  logo: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center", marginBottom: radius.lg, ...cardShadow,
  },
  logoText: { color: colors.white, fontSize: 34, fontWeight: "800" },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 6, lineHeight: 20 },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: radius.xl, ...cardShadow },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 4, marginTop: 6 },
  input: {
    backgroundColor: colors.surfaceSoft, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.text, marginBottom: 8,
  },
  startBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: 16, ...cardShadow,
  },
  startBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});