import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { useSessionStore } from "../../../src/stores/sessionStore";
import { usePaymentStore } from "../../../src/stores/paymentStore";
import { formatCurrency, getFrequencyLabel, getStatusColor } from "../../../src/utils/formatters";
import { formatDate, formatTime } from "../../../src/utils/date";

export default function PatientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById } = usePatientStore();
  const { sessions, loadByPatient: loadSessions } = useSessionStore();
  const { payments, loadByPatient: loadPayments } = usePaymentStore();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    const p = await getById(id);
    setPatient(p);
    await Promise.all([loadSessions(id), loadPayments(id)]);
    setLoading(false);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4A90D9" /></View>;
  }
  if (!patient) {
    return <View style={styles.center}><Text>Paciente no encontrado</Text></View>;
  }

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.dni}>Cédula: {patient.dni}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, patient.ageCategory === "MINOR" ? styles.minorBadge : styles.adultBadge]}>
            <Text style={styles.badgeText}>{patient.ageCategory === "MINOR" ? "Menor" : "Adulto"} · {patient.age} años</Text>
          </View>
        </View>
        {patient.parentsNames && <Text style={styles.parents}>Padres: {patient.parentsNames}</Text>}
        {patient.bankAccount && <Text style={styles.info}>Cuenta: {patient.bankAccount}</Text>}
        {patient.regularSchedule && (
          <Text style={styles.info}>
            Horario: {patient.regularSchedule.weekDay} a las {patient.regularSchedule.time}
          </Text>
        )}
        <Text style={styles.info}>Pago: {getFrequencyLabel(patient.paymentFrequency)} - {formatCurrency(patient.paymentAmount)}</Text>
        {patient.notes ? <Text style={styles.notes}>Notas: {patient.notes}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{sessions.length}</Text><Text style={styles.statLabel}>Sesiones</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{formatCurrency(totalPaid)}</Text><Text style={styles.statLabel}>Pagado</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: "#e74c3c" }]}>{formatCurrency(totalPending)}</Text><Text style={styles.statLabel}>Pendiente</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Sesiones</Text>
      {sessions.slice(0, 10).map((s) => (
        <View key={s.id} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Text style={styles.itemDate}>{formatDate(new Date(s.date))}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(s.status) }]} />
          </View>
          <Text style={styles.itemDetail}>{formatTime(new Date(s.date))} · {s.duration}min</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Pagos</Text>
      {payments.slice(0, 10).map((p) => (
        <View key={p.id} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Text style={styles.itemDate}>{formatDate(new Date(p.date))} - {formatCurrency(p.amount)}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(p.status) }]} />
          </View>
          <Text style={styles.itemDetail}>{getFrequencyLabel(p.frequency)}</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { backgroundColor: "#fff", margin: 12, borderRadius: 12, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  dni: { fontSize: 14, color: "#888", marginTop: 2 },
  badgeRow: { flexDirection: "row", marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  minorBadge: { backgroundColor: "#e8f4fd" },
  adultBadge: { backgroundColor: "#f0f0f0" },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#555" },
  parents: { fontSize: 13, color: "#666", marginTop: 8 },
  info: { fontSize: 13, color: "#666", marginTop: 4 },
  notes: { fontSize: 12, color: "#888", marginTop: 8, fontStyle: "italic" },
  statsRow: { flexDirection: "row", marginHorizontal: 12, gap: 8, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center" },
  statNum: { fontSize: 16, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginLeft: 16, marginTop: 8, marginBottom: 8 },
  itemCard: { backgroundColor: "#fff", marginHorizontal: 12, marginVertical: 3, borderRadius: 8, padding: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemDate: { fontSize: 14, fontWeight: "500", color: "#333" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  itemDetail: { fontSize: 12, color: "#888", marginTop: 2 },
});
