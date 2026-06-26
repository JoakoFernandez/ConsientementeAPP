import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { usePaymentStore } from "../../../src/stores/paymentStore";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PaymentFrequency } from "@consientemente/core";
import { formatCurrency, getStatusColor } from "../../../src/utils/formatters";
import { formatDate } from "../../../src/utils/date";

type Period = "daily" | "weekly" | "monthly";

export default function Payments() {
  const { payments, loading, loadByRange, register, markPaid } = usePaymentStore();
  const { patients, load: loadPatients } = usePatientStore();
  const [period, setPeriod] = useState<Period>("daily");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newPatientId, setNewPatientId] = useState("");
  const [newFrequency, setNewFrequency] = useState(PaymentFrequency.PER_SESSION);

  useEffect(() => {
    loadPaymentsForPeriod();
    loadPatients();
  }, [period]);

  function loadPaymentsForPeriod() {
    const now = new Date();
    let from: Date, to: Date;
    if (period === "daily") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(from.getTime() + 86400000);
    } else if (period === "weekly") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      from = new Date(now.getFullYear(), now.getMonth(), diff);
      to = new Date(from.getTime() + 7 * 86400000);
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    loadByRange(from, to);
  }

  function getPatientName(id: string) {
    return patients.find((p) => p.id === id)?.name ?? "Desconocido";
  }

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  async function handleMarkPaid(id: string) {
    await markPaid(id);
  }

  async function handleNewPayment() {
    if (!newPatientId || !newAmount) {
      Alert.alert("Error", "Seleccione paciente e ingrese monto");
      return;
    }
    await register({
      patientId: newPatientId,
      amount: parseFloat(newAmount),
      date: new Date(),
      frequency: newFrequency,
    });
    setNewAmount("");
    setShowNewForm(false);
    loadPaymentsForPeriod();
  }

  return (
    <View style={styles.container}>
      <View style={styles.periodRow}>
        {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === "daily" ? "Hoy" : p === "weekly" ? "Semana" : "Mes"}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewForm(!showNewForm)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryAmt}>{formatCurrency(totalPaid)}</Text><Text style={styles.summaryLabel}>Cobrado</Text></View>
        <View style={styles.summaryCard}><Text style={[styles.summaryAmt, { color: "#e74c3c" }]}>{formatCurrency(totalPending)}</Text><Text style={styles.summaryLabel}>Pendiente</Text></View>
      </View>

      {showNewForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Registrar Pago</Text>
          <FlatList
            data={patients}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.patientChip, newPatientId === item.id && styles.chipActive]}
                onPress={() => setNewPatientId(item.id)}
              >
                <Text style={[styles.chipText, newPatientId === item.id && styles.chipTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 50, marginBottom: 8 }}
          />
          <View style={styles.freqRow}>
            {[PaymentFrequency.PER_SESSION, PaymentFrequency.WEEKLY, PaymentFrequency.MONTHLY].map((f) => (
              <TouchableOpacity
                key={f} style={[styles.freqChip, newFrequency === f && styles.chipActive]}
                onPress={() => setNewFrequency(f)}
              >
                <Text style={[styles.chipText, newFrequency === f && styles.chipTextActive]}>
                  {f === PaymentFrequency.PER_SESSION ? "Sesión" : f === PaymentFrequency.WEEKLY ? "Semanal" : "Mensual"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.currencyLabel}>Gs.</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
            </View>
            <TouchableOpacity style={styles.submitPaymentBtn} onPress={handleNewPayment}>
              <Text style={styles.submitPaymentText}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
      ) : payments.length === 0 ? (
        <Text style={styles.emptyText}>No hay pagos en este período</Text>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.patientName}>{getPatientName(item.patientId)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status === "PAID" ? "Pagado" : item.status === "PENDING" ? "Pendiente" : "Vencido"}</Text>
                </View>
              </View>
              <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.paymentDate}>{formatDate(new Date(item.date))}</Text>
              {item.status === "PENDING" && (
                <TouchableOpacity style={styles.payBtn} onPress={() => handleMarkPaid(item.id)}>
                  <Text style={styles.payBtnText}>Marcar como Pagado</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  periodRow: { flexDirection: "row", padding: 12, gap: 8 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#fff" },
  periodActive: { backgroundColor: "#4A90D9" },
  periodText: { fontSize: 13, fontWeight: "600", color: "#666" },
  periodTextActive: { color: "#fff" },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#27ae60", justifyContent: "center", alignItems: "center", marginLeft: "auto" },
  addBtnText: { fontSize: 20, color: "#fff", fontWeight: "700" },
  summaryRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center" },
  summaryAmt: { fontSize: 18, fontWeight: "700", color: "#27ae60" },
  summaryLabel: { fontSize: 11, color: "#888", marginTop: 2 },
  formCard: { backgroundColor: "#fff", margin: 12, borderRadius: 12, padding: 16 },
  formTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  patientChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f0f0f0", marginRight: 6 },
  chipActive: { backgroundColor: "#4A90D9" },
  chipText: { fontSize: 12, color: "#666" },
  chipTextActive: { color: "#fff" },
  freqRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  freqChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f0f0f0" },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currencyLabel: { fontSize: 18, fontWeight: "700", color: "#333" },
  amountInput: { backgroundColor: "#f9f9f9", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, borderWidth: 1, borderColor: "#e0e0e0" },
  submitPaymentBtn: { backgroundColor: "#27ae60", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 8 },
  submitPaymentText: { color: "#fff", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
  paymentCard: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientName: { fontWeight: "600", fontSize: 15, color: "#333" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  paymentAmount: { fontSize: 20, fontWeight: "700", color: "#333", marginTop: 4 },
  paymentDate: { fontSize: 12, color: "#888", marginTop: 2 },
  payBtn: { marginTop: 8, backgroundColor: "#27ae60", borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  payBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
