import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PaymentFrequency } from "@consientemente/core";
import { PatientAgeCategory } from "@consientemente/core";
import { WeekDay } from "@consientemente/core";
import { t } from "../../../src/i18n";
import { currencySymbol } from "../../../src/utils/formatters";
import { colors, radius, cardShadow } from "../../../src/theme";

export default function NewPatient() {
  const router = useRouter();
  const { create } = usePatientStore();
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ageCategory, setAgeCategory] = useState<PatientAgeCategory>(PatientAgeCategory.ADULT);
  const [age, setAge] = useState("");
  const [parentsNames, setParentsNames] = useState("");
  const [hasSchedule, setHasSchedule] = useState(false);
  const [weekDay, setWeekDay] = useState<WeekDay>(WeekDay.MONDAY);
  const [time, setTime] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(PaymentFrequency.PER_SESSION);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!dni || !name || !age) {
      Alert.alert(t("common.error"), t("patient.requiredFields"));
      return;
    }
    await create({
      dni, name, bankAccount,
      ageCategory, age: parseInt(age),
      parentsNames,
      regularSchedule: hasSchedule ? { weekDay, time } : null,
      paymentFrequency,
      paymentAmount: parseFloat(paymentAmount) || 0,
      notes,
    });
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>{t("patient.dni")} *</Text>
      <TextInput style={styles.input} value={dni} onChangeText={setDni} placeholder="1234567" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.name")} *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre y Apellido" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.bankAccount")}</Text>
      <TextInput style={styles.input} value={bankAccount} onChangeText={setBankAccount} placeholder="Número de cuenta" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.ageCategory")}</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, ageCategory === PatientAgeCategory.MINOR && styles.toggleActive]}
          onPress={() => setAgeCategory(PatientAgeCategory.MINOR)}
        ><Text style={[styles.toggleText, ageCategory === PatientAgeCategory.MINOR && styles.toggleTextActive]}>{t("patient.minor")}</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, ageCategory === PatientAgeCategory.ADULT && styles.toggleActive]}
          onPress={() => setAgeCategory(PatientAgeCategory.ADULT)}
        ><Text style={[styles.toggleText, ageCategory === PatientAgeCategory.ADULT && styles.toggleTextActive]}>{t("patient.adult")}</Text></TouchableOpacity>
      </View>

      <Text style={styles.label}>{t("patient.age")} *</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.parentsNames")}</Text>
      <TextInput style={styles.input} value={parentsNames} onChangeText={setParentsNames} placeholder="Padre y Madre" placeholderTextColor={colors.textMuted} />

      <View style={styles.scheduleSection}>
        <TouchableOpacity onPress={() => setHasSchedule(!hasSchedule)} style={styles.scheduleToggleTouch}>
          <Text style={styles.scheduleToggle}>
            {hasSchedule ? `✓ ${t("patient.regularSchedule")}` : `✚ ${t("patient.addSchedule")}`}
          </Text>
        </TouchableOpacity>
        {hasSchedule && (
          <>
            <Text style={styles.label}>{t("patient.weekDay")}</Text>
            <View style={styles.toggleRow}>
              {Object.values(WeekDay).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.dayBtn, weekDay === w && styles.toggleActive]}
                  onPress={() => setWeekDay(w)}
                ><Text style={[styles.dayText, weekDay === w && styles.toggleTextActive]}>{w.slice(0, 2)}</Text></TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>{t("patient.time")}</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="09:00" placeholderTextColor={colors.textMuted} />
          </>
        )}
      </View>

      <Text style={styles.label}>{t("patient.paymentFrequency")}</Text>
      <View style={styles.toggleRow}>
        {[
          { value: PaymentFrequency.PER_SESSION, key: "patient.perSession" },
          { value: PaymentFrequency.WEEKLY, key: "patient.weekly" },
          { value: PaymentFrequency.MONTHLY, key: "patient.monthly" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.freqBtn, paymentFrequency === opt.value && styles.toggleActive]}
            onPress={() => setPaymentFrequency(opt.value)}
          ><Text style={[styles.freqText, paymentFrequency === opt.value && styles.toggleTextActive]}>{t(opt.key)}</Text></TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t("patient.paymentAmount")} ({currencySymbol()})</Text>
      <TextInput style={styles.input} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.notes")}</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{t("common.save")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: radius.lg },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginTop: radius.md, marginBottom: 4 },
  input: {
    backgroundColor: colors.surfaceSoft, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  toggleTextActive: { color: colors.white },
  scheduleSection: { marginTop: 8 },
  scheduleToggleTouch: { paddingVertical: 4 },
  scheduleToggle: { fontSize: 14, fontWeight: "600", color: colors.primary, marginBottom: 8 },
  dayBtn: { padding: 8, borderRadius: 6, backgroundColor: colors.surfaceMuted, minWidth: 36, alignItems: "center" },
  dayText: { fontSize: 12, fontWeight: "500", color: colors.textSecondary },
  freqBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: "center" },
  freqText: { fontSize: 13, fontWeight: "500", color: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: 20,
    ...cardShadow,
  },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
