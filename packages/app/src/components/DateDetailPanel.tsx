import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Session, Patient, SessionStatus } from "@consientemente/core";
import { formatTime, formatDate } from "../utils/date";
import { t } from "../i18n";
import { colors, radius, cardShadow } from "../theme";

interface DayPlanPanelProps {
  date: Date;
  sessions: Session[];
  patients: Patient[];
  holiday?: string | null;
  onAddPatient: (patient: Patient, time?: string) => void;
  onNewSession: () => void;
  onRemovePatient: (session: Session) => void;
  onToggleStatus: (session: Session, status: SessionStatus) => void;
}

export function DateDetailPanel({
  date,
  sessions,
  patients,
  holiday,
  onAddPatient,
  onNewSession,
  onRemovePatient,
  onToggleStatus,
}: DayPlanPanelProps) {
  const [showAddList, setShowAddList] = useState(false);

  const addedPatientIds = useMemo(() => new Set(sessions.map((s) => s.patientId)), [sessions]);

  const otherPatients = useMemo(
    () => patients.filter((p) => p.isActive && !addedPatientIds.has(p.id)),
    [patients, addedPatientIds]
  );

  const getPatientName = (patientId: string) =>
    patients.find((p) => p.id === patientId)?.name ?? t("common.unknown");

  const defaultTime = (patient: Patient) => patient.regularSchedules[0]?.time ?? "09:00";

  const renderStatusChips = (session: Session) => (
    <View style={styles.chipRow}>
      <TouchableOpacity
        style={[styles.chip, session.status === SessionStatus.WAITING_CONFIRMATION && styles.chipActiveWaiting]}
        onPress={() =>
          session.status !== SessionStatus.WAITING_CONFIRMATION &&
          onToggleStatus(session, SessionStatus.WAITING_CONFIRMATION)
        }
      >
        <Text
          style={[
            styles.chipText,
            session.status === SessionStatus.WAITING_CONFIRMATION && styles.chipTextActive,
          ]}
        >
          {t("calendar.waiting")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chip, session.status === SessionStatus.CONFIRMED && styles.chipActiveConfirmed]}
        onPress={() =>
          session.status !== SessionStatus.CONFIRMED && onToggleStatus(session, SessionStatus.CONFIRMED)
        }
      >
        <Text
          style={[styles.chipText, session.status === SessionStatus.CONFIRMED && styles.chipTextActive]}
        >
          {t("calendar.confirmed")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.dateTitle}>{formatDate(date)}</Text>
        <TouchableOpacity style={styles.newSessionBtn} onPress={onNewSession}>
          <Text style={styles.newSessionText}>+ {t("session.new")}</Text>
        </TouchableOpacity>
      </View>
      {holiday ? (
        <View style={styles.holidayBadge}>
          <Text style={styles.holidayBadgeText}>
            {t("calendar.holiday")}: {holiday}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>{t("calendar.patientsOfDay")} ({sessions.length})</Text>
      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>{t("calendar.noPatientsOfDay")}</Text>
      ) : (
        sessions.map((s) => (
          <View key={s.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.patientName}>{getPatientName(s.patientId)}</Text>
                <Text style={styles.sessionTime}>
                  {formatTime(new Date(s.date))} · {s.duration}min
                </Text>
              </View>
              <TouchableOpacity onPress={() => onRemovePatient(s)} style={styles.removeBtn}>
                <Text style={styles.removeText}>{t("calendar.removePatient")}</Text>
              </TouchableOpacity>
            </View>
            {renderStatusChips(s)}
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addPatientBtn} onPress={() => setShowAddList((v) => !v)}>
        <Text style={styles.addPatientText}>{t("calendar.addPatient")}</Text>
      </TouchableOpacity>

      {showAddList && otherPatients.length === 0 && (
        <Text style={styles.emptyText}>{t("calendar.noPatientsOfDay")}</Text>
      )}
      {showAddList &&
        otherPatients.map((p) => (
          <View key={p.id} style={styles.suggestCard}>
            <View style={styles.suggestInfo}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={styles.sessionTime}>
                {p.regularSchedules.length > 0
                  ? `${t("patient.weekDay")} ${formatTime(dateFromTime(date, defaultTime(p)))}`
                  : formatTime(dateFromTime(date, defaultTime(p)))}
              </Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => onAddPatient(p, defaultTime(p))}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );
}

function dateFromTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const d = new Date(date);
  d.setHours(h || 9, m || 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  container: { padding: radius.lg, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, margin: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: radius.md },
  dateTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  newSessionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newSessionText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  holidayBadge: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.sm,
    paddingHorizontal: radius.md,
    paddingVertical: 6,
    marginBottom: radius.md,
    alignSelf: "flex-start",
  },
  holidayBadgeText: { color: colors.dangerText, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8, marginTop: 8 },
  emptyText: { color: colors.textMuted, fontStyle: "italic", marginBottom: 8 },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: radius.md,
    marginBottom: 8,
    ...cardShadow,
  },
  sessionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionInfo: { flex: 1 },
  patientName: { fontWeight: "600", fontSize: 15, color: colors.text },
  sessionTime: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  chipRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  chip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActiveWaiting: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  chipActiveConfirmed: { backgroundColor: colors.successLight, borderColor: colors.success },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.text },
  suggestCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: radius.md,
    marginBottom: 6,
  },
  suggestInfo: { flex: 1 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontSize: 20, fontWeight: "700", lineHeight: 22 },
  addPatientBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  addPatientText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
});