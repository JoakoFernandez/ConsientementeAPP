import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../src/stores/patientStore";
import { useSessionStore } from "../../src/stores/sessionStore";
import { usePaymentStore } from "../../src/stores/paymentStore";
import { useClinicStore } from "../../src/stores/clinicStore";
import { formatCurrency } from "../../src/utils/formatters";
import { t } from "../../src/i18n";
import { colors, radius, cardShadow } from "../../src/theme";

export default function Dashboard() {
  const router = useRouter();
  const { profile } = useClinicStore();
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>{profile?.clinicName || t("dashboard.welcome")}</Text>
        {profile?.psychologistName ? (
          <Text style={styles.welcomeSubtitle}>{profile.psychologistName}</Text>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.statNumber}>{todaySessions.length}</Text>
          <Text style={styles.statLabel}>{t("dashboard.todaySessions")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>
          <Text style={styles.statNumber}>{pendingPayments.length}</Text>
          <Text style={styles.statLabel}>{t("dashboard.pendingPayments")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
          <Text style={styles.statNumber}>{formatCurrency(collectedToday)}</Text>
          <Text style={styles.statLabel}>{t("dashboard.collectedToday")}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("dashboard.quickActions")}</Text>
      <View style={styles.grid}>
        <ActionButton icon="+" label={t("dashboard.newPatient")} onPress={() => router.push("/(drawer)/patients/new")} />
        <ActionButton icon="$" label={t("dashboard.registerPayment")} onPress={() => router.push("/(drawer)/payments")} />
        <ActionButton icon="{" label={t("dashboard.viewCalendar")} onPress={() => router.push("/(drawer)/calendar")} />
        <ActionButton icon="P" label={t("dashboard.patients")} onPress={() => router.push("/(drawer)/patients")} />
        <ActionButton icon="G" label={t("dashboard.payments")} onPress={() => router.push("/(drawer)/payments")} />
        <ActionButton icon="S" label={t("dashboard.reports")} onPress={() => router.push("/(drawer)/reports")} />
      </View>
    </ScrollView>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.actionIconWrap}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  welcome: { padding: radius.lg, paddingBottom: 4 },
  welcomeTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  welcomeSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: "row", padding: radius.md, gap: 8 },
  statCard: { flex: 1, borderRadius: radius.md, padding: radius.lg, alignItems: "center", ...cardShadow },
  statNumber: { fontSize: 20, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: radius.lg, marginTop: 8, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: radius.md, gap: 10, marginBottom: 20 },
  actionBtn: {
    width: "31%", backgroundColor: colors.surface, borderRadius: radius.md, padding: radius.lg, alignItems: "center", ...cardShadow,
  },
  actionIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft,
    justifyContent: "center", alignItems: "center", marginBottom: 6,
  },
  actionIcon: { fontSize: 18, color: colors.primary, fontWeight: "700" },
  actionLabel: { fontSize: 11, color: colors.textSecondary, textAlign: "center" },
});