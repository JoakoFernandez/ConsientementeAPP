import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Session, Patient } from "@consientemente/core";
import { formatTime, formatDate } from "../utils/date";
import { getStatusColor } from "../utils/formatters";

interface DateDetailPanelProps {
  date: Date;
  sessions: Session[];
  patients: Patient[];
  onSessionPress?: (session: Session) => void;
}

export function DateDetailPanel({ date, sessions, patients, onSessionPress }: DateDetailPanelProps) {
  const getPatientName = (patientId: string) =>
    patients.find((p) => p.id === patientId)?.name ?? "Unknown";

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{formatDate(date)}</Text>
      <Text style={styles.sectionTitle}>Sesiones ({sessions.length})</Text>
      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>No hay sesiones</Text>
      ) : (
        sessions.map((s) => (
          <View key={s.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.patientName}>{getPatientName(s.patientId)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(s.status) }]}>
                <Text style={styles.statusText}>{s.status}</Text>
              </View>
            </View>
            <Text style={styles.sessionTime}>{formatTime(s.date)} · {s.duration}min</Text>
            {s.notes ? <Text style={styles.notes}>{s.notes}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, margin: 8 },
  dateTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#333" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 8 },
  emptyText: { color: "#999", fontStyle: "italic" },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientName: { fontWeight: "600", fontSize: 15, color: "#333" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  sessionTime: { fontSize: 13, color: "#888", marginTop: 4 },
  notes: { fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" },
});
