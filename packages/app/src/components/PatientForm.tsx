import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Patient, PaymentFrequency, PatientAgeCategory, WeekDay, RegularSchedule, BankAccount } from "@consientemente/core";
import { t } from "../i18n";
import { currencySymbol, getWeekDayLabel } from "../utils/formatters";
import { colors, radius, cardShadow } from "../theme";

export interface PatientFormData {
  dni: string;
  name: string;
  bankAccounts: BankAccount[];
  ageCategory: PatientAgeCategory;
  age: number;
  parentsNames: string;
  regularSchedules: RegularSchedule[];
  paymentFrequency: PaymentFrequency;
  paymentAmount: number;
  notes: string;
}

interface PatientFormProps {
  initial?: Patient | null;
  onSubmit: (data: PatientFormData) => Promise<void>;
}

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

export function PatientForm({ initial, onSubmit }: PatientFormProps) {
  const [dni, setDni] = useState(initial?.dni ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [banks, setBanks] = useState<BankAccount[]>(
    initial?.bankAccounts?.length ? initial.bankAccounts : []
  );
  const [ageCategory, setAgeCategory] = useState<PatientAgeCategory>(initial?.ageCategory ?? PatientAgeCategory.ADULT);
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [parentsNames, setParentsNames] = useState(initial?.parentsNames ?? "");
  const [schedules, setSchedules] = useState<RegularSchedule[]>(
    initial?.regularSchedules?.length ? initial.regularSchedules : []
  );
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(initial?.paymentFrequency ?? PaymentFrequency.PER_SESSION);
  const [paymentAmount, setPaymentAmount] = useState(initial ? String(initial.paymentAmount) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const updateSchedule = (index: number, patch: Partial<RegularSchedule>) => {
    setSchedules((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSchedule = () => {
    setSchedules((prev) => [...prev, { weekDay: WeekDay.MONDAY, time: "" }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBank = (index: number, patch: Partial<BankAccount>) => {
    setBanks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const addBank = () => {
    setBanks((prev) => [...prev, { bankName: "", alias: "", accountNumber: "" }]);
  };

  const removeBank = (index: number) => {
    setBanks((prev) => prev.filter((_, i) => i !== index));
  };

  function validate(): string | null {
    const dniValue = dni.trim();
    if (!dniValue || !name.trim()) return t("patient.requiredFields");
    if (!/^\d+$/.test(dniValue)) return t("patient.invalidDni");

    const ageNum = parseInt(age, 10);
    if (!age || Number.isNaN(ageNum)) return t("patient.invalidAge");
    if (ageNum < 0 || ageNum > 120) return t("patient.invalidAge");

    const amountNum = parseFloat(paymentAmount);
    if (paymentAmount !== "" && (Number.isNaN(amountNum) || amountNum < 0)) return t("patient.invalidAmount");

    for (const s of schedules) {
      if (s.time.trim() !== "" && !TIME_RE.test(s.time.trim())) return t("patient.invalidTime");
    }

    for (const b of banks) {
      if (b.accountNumber.trim() !== "" && !/^\d+$/.test(b.accountNumber.trim())) {
        return t("patient.invalidAccountNumber");
      }
    }

    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      Alert.alert(t("common.error"), error);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        dni: dni.trim(),
        name: name.trim(),
        bankAccounts: banks.filter((b) => b.bankName.trim() !== "" || b.alias.trim() !== "" || b.accountNumber.trim() !== ""),
        ageCategory,
        age: parseInt(age, 10),
        parentsNames,
        regularSchedules: schedules.filter((s) => s.time.trim() !== ""),
        paymentFrequency,
        paymentAmount: parseFloat(paymentAmount) || 0,
        notes,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>{t("patient.dni")} *</Text>
      <TextInput style={styles.input} value={dni} onChangeText={(v) => setDni(v.replace(/[^\d]/g, ""))} keyboardType="numeric" placeholder="1234567" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.name")} *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre y Apellido" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.bankAccount")}</Text>
      {banks.length === 0 && <Text style={styles.hint}>{t("patient.noBankAccounts")}</Text>}
      {banks.map((b, idx) => (
        <View key={idx} style={styles.bankRow}>
          <View style={styles.bankHeaderRow}>
            <Text style={styles.bankTitle}>{t("patient.bankAccount")} {idx + 1}</Text>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeBank(idx)}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subLabel}>{t("patient.bankName")}</Text>
          <TextInput style={styles.input} value={b.bankName} onChangeText={(v) => updateBank(idx, { bankName: v })} placeholder="Ej. Banco Nacional" placeholderTextColor={colors.textMuted} />
          <Text style={styles.subLabel}>{t("patient.bankAlias")}</Text>
          <TextInput style={styles.input} value={b.alias} onChangeText={(v) => updateBank(idx, { alias: v })} placeholder="Ej. JUAN.ALIAS" placeholderTextColor={colors.textMuted} />
          <Text style={styles.subLabel}>{t("patient.accountNumber")}</Text>
          <TextInput style={styles.input} value={b.accountNumber} onChangeText={(v) => updateBank(idx, { accountNumber: v.replace(/[^\d]/g, "") })} keyboardType="numeric" placeholder="0000000000" placeholderTextColor={colors.textMuted} />
        </View>
      ))}
      <TouchableOpacity style={styles.addSectionBtn} onPress={addBank}>
        <Text style={styles.addSectionText}>✚ {t("patient.addBankAccount")}</Text>
      </TouchableOpacity>

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
      <TextInput style={styles.input} value={age} onChangeText={(v) => setAge(v.replace(/[^\d]/g, ""))} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.parentsNames")}</Text>
      <TextInput style={styles.input} value={parentsNames} onChangeText={setParentsNames} placeholder="Padre y Madre" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.regularSchedule")}</Text>
      {schedules.length === 0 && <Text style={styles.hint}>{t("patient.noSchedule")}</Text>}
      {schedules.map((s, idx) => (
        <View key={idx} style={styles.scheduleRow}>
          <View style={styles.scheduleDays}>
            {Object.values(WeekDay).map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.dayBtn, s.weekDay === w && styles.toggleActive]}
                onPress={() => updateSchedule(idx, { weekDay: w })}
              ><Text style={[styles.dayText, s.weekDay === w && styles.toggleTextActive]}>{getWeekDayLabel(w).slice(0, 3)}</Text></TouchableOpacity>
            ))}
          </View>
          <View style={styles.scheduleTimeRow}>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={s.time}
              onChangeText={(v) => updateSchedule(idx, { time: v })}
              placeholder="09:00"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeSchedule(idx)}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addSectionBtn} onPress={addSchedule}>
        <Text style={styles.addSectionText}>✚ {t("patient.addSchedule")}</Text>
      </TouchableOpacity>

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
      <TextInput style={styles.input} value={paymentAmount} onChangeText={(v) => setPaymentAmount(v.replace(/[^\d.,]/g, ""))} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("patient.notes")}</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{t("common.save")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: radius.lg },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginTop: radius.md, marginBottom: 4 },
  subLabel: { fontSize: 12, fontWeight: "600", color: colors.textMuted, marginTop: 6, marginBottom: 2 },
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
  hint: { fontSize: 12, color: colors.textMuted, fontStyle: "italic", marginBottom: 4 },
  bankRow: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: radius.sm, marginBottom: 8 },
  bankHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  bankTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  scheduleRow: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: radius.sm, marginBottom: 8, gap: 8 },
  scheduleDays: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  dayBtn: { padding: 6, borderRadius: 6, backgroundColor: colors.surface, minWidth: 42, alignItems: "center" },
  dayText: { fontSize: 11, fontWeight: "600", color: colors.textSecondary },
  scheduleTimeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeInput: { flex: 1 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.dangerLight, alignItems: "center", justifyContent: "center" },
  removeBtnText: { fontSize: 20, color: colors.danger, fontWeight: "700", lineHeight: 24 },
  addSectionBtn: { paddingVertical: 6 },
  addSectionText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  freqBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: "center" },
  freqText: { fontSize: 13, fontWeight: "500", color: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: 20,
    ...cardShadow,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});