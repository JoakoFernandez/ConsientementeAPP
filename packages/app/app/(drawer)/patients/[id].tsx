import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { useSessionStore } from "../../../src/stores/sessionStore";
import { usePaymentStore } from "../../../src/stores/paymentStore";
import { formatCurrency, getFrequencyLabel, getStatusColor } from "../../../src/utils/formatters";
import { formatDate, formatTime } from "../../../src/utils/date";
import { t } from "../../../src/i18n";
import { colors, radius, cardShadow } from "../../../src/theme";

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
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!patient) {
    return <View style={styles.center}><Text style={styles.notFound}>{t("patient.notFound")}</Text></View>;
  }

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.dni}>{t("patient.dni")}: {patient.dni}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, patient.ageCategory === "MINOR" ? styles.minorBadge : styles.adultBadge]}>
            <Text style={[styles.badgeText, patient.ageCategory === "MINOR" ? styles.minorText : styles.adultText]}>
              {patient.ageCategory === "MINOR" ? t("patient.minor") : t("patient.adult")} · {patient.age} años
            </Text>
          </View>
        </View>
        {patient.parentsNames && <Text style={styles.parents}>{t("patient.parentsNames")}: {patient.parentsNames}</Text>}
        {patient.bankAccount && <Text style={styles.info}>{t("patient.bankAccount")}: {patient.bankAccount}</Text>}
        {patient.regularSchedule && (
          <Text style={styles.info}>
            {t("patient.regularSchedule")}: {patient.regularSchedule.weekDay} a las {patient.regularSchedule.time}
          </Text>
        )}
        <Text style={styles.info}>{t("patient.paymentLabel")}: {getFrequencyLabel(patient.paymentFrequency)} - {formatCurrency(patient.paymentAmount)}</Text>
        {patient.notes ? <Text style={styles.notes}>{t("patient.notes")}: {patient.notes}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{sessions.length}</Text><Text style={styles.statLabel}>{t("session.title")}</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{formatCurrency(totalPaid)}</Text><Text style={styles.statLabel}>{t("payment.paid")}</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: colors.danger }]}>{formatCurrency(totalPending)}</Text><Text style={styles.statLabel}>{t("payment.pending")}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>{t("session.title")}</Text>
      {sessions.slice(0, 10).map((s) => (
        <View key={s.id} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Text style={styles.itemDate}>{formatDate(new Date(s.date))}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(s.status) }]} />
          </View>
          <Text style={styles.itemDetail}>{formatTime(new Date(s.date))} · {s.duration}min</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t("payment.title")}</Text>
      {payments.slice(0, 10).map((p) => (
        <View key={p.id} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Text style={styles.itemDate}>{formatDate(new Date(p.date))} - {formatCurrency(p.amount)}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(p.status) }]} />
          </View>
          <Text style={styles.itemDetail}>{getFrequencyLabel(p.frequency)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  notFound: { color: colors.textSecondary, fontSize: 16 },
  headerCard: { backgroundColor: colors.surface, margin: radius.md, borderRadius: radius.md, padding: radius.lg, ...cardShadow },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  dni: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: "row", marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  minorBadge: { backgroundColor: colors.infoLight },
  adultBadge: { backgroundColor: colors.surfaceMuted },
  badgeText: { fontSize: 12, fontWeight: "600" },
  minorText: { color: colors.infoText },
  adultText: { color: colors.textSecondary },
  parents: { fontSize: 13, color: colors.text, marginTop: 8 },
  info: { fontSize: 13, color: colors.text, marginTop: 4 },
  notes: { fontSize: 12, color: colors.textSecondary, marginTop: 8, fontStyle: "italic" },
  statsRow: { flexDirection: "row", marginHorizontal: radius.md, gap: 8, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: radius.md, alignItems: "center", ...cardShadow },
  statNum: { fontSize: 16, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: radius.lg, marginTop: 8, marginBottom: 8 },
  itemCard: { backgroundColor: colors.surface, marginHorizontal: radius.md, marginVertical: 3, borderRadius: radius.sm, padding: radius.md, ...cardShadow },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemDate: { fontSize: 14, fontWeight: "500", color: colors.text },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  itemDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
