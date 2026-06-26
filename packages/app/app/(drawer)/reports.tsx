import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Share, Platform } from "react-native";
import { usePaymentStore } from "../../src/stores/paymentStore";
import { usePatientStore } from "../../src/stores/patientStore";
import { formatCurrency, getStatusColor } from "../../src/utils/formatters";
import { formatDate } from "../../src/utils/date";
import { ExportToCSV } from "@consientemente/core";
import { SqlitePaymentRepository } from "../../src/adapters/sqlite/SqlitePaymentRepository";

const csvExporter = new ExportToCSV(new SqlitePaymentRepository());

export default function Reports() {
  const { payments, loading, loadByRange } = usePaymentStore();
  const { patients, load: loadPatients } = usePatientStore();
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");

  useEffect(() => {
    loadPeriod();
    loadPatients();
  }, [period]);

  function loadPeriod() {
    const now = new Date();
    let from: Date, to: Date;
    if (period === "weekly") {
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

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const paidAmount = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);

  function getPatientName(id: string) {
    return patients.find((p) => p.id === id)?.name ?? "Desconocido";
  }

  async function handleExport() {
    const csv = await csvExporter.execute({});
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pagos.csv";
      a.click();
    } else {
      await Share.share({ message: csv, title: "pagos.csv" });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.periodRow}>
        {(["weekly", "monthly"] as const).map((p) => (
          <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.active]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.activeText]}>{p === "weekly" ? "Semanal" : "Mensual"}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{payments.length}</Text>
          <Text style={styles.summaryLabel}>Total Pagos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{formatCurrency(paidAmount)}</Text>
          <Text style={styles.summaryLabel}>Cobrado</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNum, { color: "#e74c3c" }]}>{formatCurrency(totalAmount - paidAmount)}</Text>
          <Text style={styles.summaryLabel}>Pendiente</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.patientName}>{getPatientName(item.patientId)}</Text>
                <Text style={styles.paymentDate}>{formatDate(new Date(item.date))}</Text>
              </View>
              <Text style={[styles.amount, { color: item.status === "PAID" ? "#27ae60" : "#e74c3c" }]}>
                {formatCurrency(item.amount)}
              </Text>
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
  active: { backgroundColor: "#4A90D9" },
  periodText: { fontSize: 13, fontWeight: "600", color: "#666" },
  activeText: { color: "#fff" },
  exportBtn: { marginLeft: "auto", backgroundColor: "#27ae60", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  exportText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  summaryRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center" },
  summaryNum: { fontSize: 16, fontWeight: "700", color: "#333" },
  summaryLabel: { fontSize: 11, color: "#888", marginTop: 2 },
  paymentRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 8, padding: 14, marginBottom: 6,
  },
  patientName: { fontSize: 14, fontWeight: "600", color: "#333" },
  paymentDate: { fontSize: 12, color: "#888", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
});
