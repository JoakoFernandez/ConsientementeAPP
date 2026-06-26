import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../src/stores/patientStore";
import { useSessionStore } from "../../src/stores/sessionStore";
import { usePaymentStore } from "../../src/stores/paymentStore";
import { formatCurrency } from "../../src/utils/formatters";
import { t } from "../../src/i18n";

export default function Dashboard() {
  const router = useRouter();
  const { patients, load: loadPatients } = usePatientStore();
  const { sessions, loadByRange: loadSessions } = useSessionStore();
  const { payments, loadByRange: loadPayments } = usePaymentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start.getTime() + 86400000);
    await Promise.all([loadPatients(), loadSessions(start, end), loadPayments(start, end)]);
    setLoading(false);
  }

  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const collectedToday = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#e8f4fd" }]}>
          <Text style={styles.statNumber}>{todaySessions.length}</Text>
          <Text style={styles.statLabel}>{t("dashboard.todaySessions")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fef9e7" }]}>
          <Text style={styles.statNumber}>{pendingPayments.length}</Text>
          <Text style={styles.statLabel}>{t("dashboard.pendingPayments")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#eafaf1" }]}>
          <Text style={styles.statNumber}>{formatCurrency(collectedToday)}</Text>
          <Text style={styles.statLabel}>{t("dashboard.collectedToday")}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("dashboard.quickActions")}</Text>
      <View style={styles.actionsRow}>
        <ActionButton icon="+" label={t("dashboard.newPatient")} onPress={() => router.push("/(drawer)/patients/new")} />
        <ActionButton icon="+" label={t("dashboard.registerPayment")} onPress={() => router.push("/(drawer)/payments")} />
      </View>
    </ScrollView>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", padding: 12, gap: 8 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginLeft: 16, marginTop: 8, marginBottom: 8 },
  actionsRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { fontSize: 24, color: "#4A90D9", fontWeight: "700" },
  actionLabel: { fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" },
});
