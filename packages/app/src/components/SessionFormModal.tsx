import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Patient } from "@consientemente/core";
import { t } from "../i18n";
import { colors, radius, cardShadow } from "../theme";

export interface SessionFormInput {
  patientId: string;
  date: Date;
  duration: number;
  notes?: string;
}

interface SessionFormModalProps {
  visible: boolean;
  patients: Patient[];
  selectedPatient?: Patient | null;
  initialDate: Date;
  onClose: () => void;
  onCreate: (input: SessionFormInput) => Promise<void>;
}

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

function toDateText(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return toDateText(d);
}

export function SessionFormModal({
  visible,
  patients,
  selectedPatient,
  initialDate,
  onClose,
  onCreate,
}: SessionFormModalProps) {
  const [patientId, setPatientId] = useState<string>("");
  const [dateText, setDateText] = useState(toDateText(initialDate));
  const [timeText, setTimeText] = useState("09:00");
  const [duration, setDuration] = useState("50");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setPatientId(selectedPatient?.id ?? "");
      setDateText(toDateText(initialDate));
      setTimeText("09:00");
      setDuration("50");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function reset() {
    setPatientId(selectedPatient?.id ?? "");
    setDateText(toDateText(initialDate));
    setTimeText("09:00");
    setDuration("50");
    setNotes("");
  }

  function close() {
    reset();
    onClose();
  }

  async function handleSave() {
    const pId = patientId || selectedPatient?.id || "";
    if (!pId) {
      Alert.alert(t("common.error"), t("session.needPatient"));
      return;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText.trim());
    const tMatch = TIME_RE.exec(timeText.trim());
    if (!m) {
      Alert.alert(t("common.error"), t("session.invalidDate"));
      return;
    }
    const [, y, mo, d] = m.map((n) => parseInt(n, 10)) as any;
    const numDate = new Date(y, mo - 1, d);
    if (numDate.getMonth() !== mo - 1 || numDate.getDate() !== d) {
      Alert.alert(t("common.error"), t("session.invalidDate"));
      return;
    }
    if (!tMatch) {
      Alert.alert(t("common.error"), t("patient.invalidTime"));
      return;
    }
    const dur = parseInt(duration, 10);
    if (!duration || Number.isNaN(dur) || dur <= 0 || dur > 999) {
      Alert.alert(t("common.error"), t("session.invalidDuration"));
      return;
    }
    numDate.setHours(parseInt(tMatch[1], 10), parseInt(tMatch[2], 10), 0, 0);
    setSaving(true);
    try {
      await onCreate({ patientId: pId, date: numDate, duration: dur, notes });
      close();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("session.new")}</Text>

          {!selectedPatient && (
            <>
              <Text style={styles.label}>{t("session.selectPatient")} *</Text>
              <ScrollView style={styles.pickerList} nestedScrollEnabled>

                {patients.filter((p) => p.isActive).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.patientRow, patientId === p.id && styles.patientRowActive]}
                    onPress={() => setPatientId(p.id)}
                  >
                    <Text style={[styles.patientRowText, patientId === p.id && styles.patientRowTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>{t("session.date")} *</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => setDateText(addDays(initialDate, 0))}>
              <Text style={styles.quickBtnText}>{t("session.today")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} onPress={() => setDateText(addDays(initialDate, 1))}>
              <Text style={styles.quickBtnText}>{t("session.tomorrow")}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={dateText}
            onChangeText={setDateText}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>{t("patient.time")} *</Text>
              <TextInput
                style={styles.input}
                value={timeText}
                onChangeText={(v) => setTimeText(v.replace(/[^\d:]/g, ""))}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>{t("session.duration")} *</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={(v) => setDuration(v.replace(/[^\d]/g, ""))}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.label}>{t("patient.notes")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={close}>
              <Text style={styles.cancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(62,54,46,0.45)",
    justifyContent: "center",
    padding: radius.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: radius.lg,
    maxHeight: "88%",
    ...cardShadow,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: radius.md },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 4, marginTop: 6 },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  textArea: { minHeight: 60, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  rowItem: { flex: 1 },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  quickBtn: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickBtnText: { color: colors.primaryDark, fontSize: 13, fontWeight: "700" },
  pickerList: { maxHeight: 180 },
  patientRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 4,
  },
  patientRowActive: { backgroundColor: colors.primaryLight },
  patientRowText: { fontSize: 14, color: colors.text },
  patientRowTextActive: { color: colors.primaryDark, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: "center" },
  cancelBtn: { backgroundColor: colors.surfaceMuted },
  cancelText: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
  saveBtn: { backgroundColor: colors.primary, ...cardShadow },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});