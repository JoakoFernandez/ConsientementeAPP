import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Patient } from "@consientemente/core";
import { formatCurrency } from "../utils/formatters";
import { t } from "../i18n";
import { colors, radius, cardShadow } from "../theme";

interface PatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const freqLabel =
    patient.paymentFrequency === "PER_SESSION" ? t("patient.perSession") :
    patient.paymentFrequency === "WEEKLY" ? t("patient.weekly") : t("patient.monthly");
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(patient)} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.name}>{patient.name}</Text>
        <View style={[styles.ageBadge, patient.ageCategory === "MINOR" ? styles.minor : styles.adult]}>
          <Text style={[styles.ageBadgeText, patient.ageCategory === "MINOR" ? styles.minorText : styles.adultText]}>
            {patient.ageCategory === "MINOR" ? t("patient.minor") : t("patient.adult")}
          </Text>
        </View>
      </View>
      <Text style={styles.dni}>{t("patient.dni")}: {patient.dni}</Text>
      <Text style={styles.frequency}>
        {freqLabel} - {formatCurrency(patient.paymentAmount)}
      </Text>
      {patient.regularSchedule && (
        <Text style={styles.schedule}>
          {patient.regularSchedule.weekDay} {patient.regularSchedule.time}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: radius.lg,
    marginHorizontal: radius.lg,
    marginVertical: 4,
    ...cardShadow,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  ageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  minor: { backgroundColor: colors.infoLight },
  adult: { backgroundColor: colors.surfaceMuted },
  ageBadgeText: { fontSize: 11, fontWeight: "600" },
  minorText: { color: colors.infoText },
  adultText: { color: colors.textSecondary },
  dni: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  frequency: { fontSize: 13, color: colors.text, marginBottom: 2 },
  schedule: { fontSize: 12, color: colors.primary, fontWeight: "500" },
});
