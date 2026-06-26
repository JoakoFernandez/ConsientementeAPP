import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PaymentFrequency } from "@consientemente/core";
import { PatientAgeCategory } from "@consientemente/core";
import { WeekDay } from "@consientemente/core";
import { t } from "../../../src/i18n";

export default function NewPatient() {
  const router = useRouter();
  const { create } = usePatientStore();
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ageCategory, setAgeCategory] = useState<PatientAgeCategory>(PatientAgeCategory.ADULT);
  const [age, setAge] = useState("");
  const [parentsNames, setParentsNames] = useState("");
  const [hasSchedule, setHasSchedule] = useState(false);
  const [weekDay, setWeekDay] = useState<WeekDay>(WeekDay.MONDAY);
  const [time, setTime] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(PaymentFrequency.PER_SESSION);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!dni || !name || !age) {
      Alert.alert("Error", "Cédula, nombre y edad son obligatorios");
      return;
    }
    await create({
      dni, name, bankAccount,
      ageCategory, age: parseInt(age),
      parentsNames,
      regularSchedule: hasSchedule ? { weekDay, time } : null,
      paymentFrequency,
      paymentAmount: parseFloat(paymentAmount) || 0,
      notes,
    });
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Cédula *</Text>
      <TextInput style={styles.input} value={dni} onChangeText={setDni} placeholder="1234567" />

      <Text style={styles.label}>Nombre Completo *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre y Apellido" />

      <Text style={styles.label}>Cuenta Bancaria</Text>
      <TextInput style={styles.input} value={bankAccount} onChangeText={setBankAccount} placeholder="Número de cuenta" />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, ageCategory === PatientAgeCategory.MINOR && styles.toggleActive]}
          onPress={() => setAgeCategory(PatientAgeCategory.MINOR)}
        ><Text style={[styles.toggleText, ageCategory === PatientAgeCategory.MINOR && styles.toggleTextActive]}>Menor</Text></TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, ageCategory === PatientAgeCategory.ADULT && styles.toggleActive]}
          onPress={() => setAgeCategory(PatientAgeCategory.ADULT)}
        ><Text style={[styles.toggleText, ageCategory === PatientAgeCategory.ADULT && styles.toggleTextActive]}>Adulto</Text></TouchableOpacity>
      </View>

      <Text style={styles.label}>Edad *</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

      <Text style={styles.label}>Nombres de los Padres</Text>
      <TextInput style={styles.input} value={parentsNames} onChangeText={setParentsNames} placeholder="Padre y Madre" />

      <View style={styles.scheduleSection}>
        <TouchableOpacity onPress={() => setHasSchedule(!hasSchedule)}>
          <Text style={styles.scheduleToggle}>
            {hasSchedule ? "✓ Horario Regular" : "✚ Agregar Horario Regular"}
          </Text>
        </TouchableOpacity>
        {hasSchedule && (
          <>
            <Text style={styles.label}>Día de la Semana</Text>
            <View style={styles.toggleRow}>
              {Object.values(WeekDay).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.dayBtn, weekDay === w && styles.toggleActive]}
                  onPress={() => setWeekDay(w)}
                ><Text style={[styles.dayText, weekDay === w && styles.toggleTextActive]}>{w.slice(0, 2)}</Text></TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Hora</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="09:00" />
          </>
        )}
      </View>

      <Text style={styles.label}>Frecuencia de Pago</Text>
      <View style={styles.toggleRow}>
        {[
          { value: PaymentFrequency.PER_SESSION, label: "Por Sesión" },
          { value: PaymentFrequency.WEEKLY, label: "Semanal" },
          { value: PaymentFrequency.MONTHLY, label: "Mensual" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.freqBtn, paymentFrequency === opt.value && styles.toggleActive]}
            onPress={() => setPaymentFrequency(opt.value)}
          ><Text style={[styles.freqText, paymentFrequency === opt.value && styles.toggleTextActive]}>{opt.label}</Text></TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Monto (Gs.)</Text>
      <TextInput style={styles.input} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>Notas</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: "#f9f9f9", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    borderWidth: 1, borderColor: "#e0e0e0",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f0f0f0" },
  toggleActive: { backgroundColor: "#4A90D9" },
  toggleText: { fontSize: 13, color: "#666", fontWeight: "500" },
  toggleTextActive: { color: "#fff" },
  scheduleSection: { marginTop: 8 },
  scheduleToggle: { fontSize: 14, fontWeight: "600", color: "#4A90D9", marginBottom: 8 },
  dayBtn: { padding: 8, borderRadius: 6, backgroundColor: "#f0f0f0", minWidth: 36, alignItems: "center" },
  dayText: { fontSize: 12, fontWeight: "500" },
  freqBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f0f0f0", alignItems: "center" },
  freqText: { fontSize: 13, fontWeight: "500", color: "#666" },
  saveBtn: {
    backgroundColor: "#4A90D9", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
