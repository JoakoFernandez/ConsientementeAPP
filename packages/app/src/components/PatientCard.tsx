import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Patient } from "@consientemente/core";
import { formatCurrency } from "../utils/formatters";

interface PatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(patient)}>
      <View style={styles.header}>
        <Text style={styles.name}>{patient.name}</Text>
        <View style={[styles.ageBadge, patient.ageCategory === "MINOR" ? styles.minor : styles.adult]}>
          <Text style={styles.ageBadgeText}>
            {patient.ageCategory === "MINOR" ? "Menor" : "Adulto"}
          </Text>
        </View>
      </View>
      <Text style={styles.dni}>Cédula: {patient.dni}</Text>
      <Text style={styles.frequency}>
        {patient.paymentFrequency === "PER_SESSION" ? "Por Sesión" :
         patient.paymentFrequency === "WEEKLY" ? "Semanal" : "Mensual"}{" "}
        - {formatCurrency(patient.paymentAmount)}
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 16, fontWeight: "700", color: "#333" },
  ageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  minor: { backgroundColor: "#e8f4fd" },
  adult: { backgroundColor: "#f0f0f0" },
  ageBadgeText: { fontSize: 11, fontWeight: "600" },
  dni: { fontSize: 13, color: "#888", marginBottom: 4 },
  frequency: { fontSize: 13, color: "#555", marginBottom: 2 },
  schedule: { fontSize: 12, color: "#4A90D9", fontWeight: "500" },
});
