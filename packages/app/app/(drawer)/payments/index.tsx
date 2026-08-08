import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { usePaymentStore } from "../../../src/stores/paymentStore";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PaymentFrequency, InvoiceStatus } from "@consientemente/core";
import { formatCurrency, getStatusColor, getInvoiceColor, currencySymbol } from "../../../src/utils/formatters";
import { formatDate } from "../../../src/utils/date";
import { t } from "../../../src/i18n";
import { showAlert } from "../../../src/utils/alert";
import { colors, radius, cardShadow } from "../../../src/theme";

type Period = "daily" | "weekly" | "monthly";

export default function Payments() {
  const { payments, loading, loadByRange, register, markPaid, setInvoiceStatus } = usePaymentStore();
  const { patients, load: loadPatients } = usePatientStore();
  const [period, setPeriod] = useState<Period>("daily");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newPatientId, setNewPatientId] = useState("");
  const [newFrequency, setNewFrequency] = useState(PaymentFrequency.PER_SESSION);
  const [newInvoiceStatus, setNewInvoiceStatus] = useState(InvoiceStatus.PENDING);

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
    return patients.find((p) => p.id === id)?.name ?? t("common.unknown");
  }

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  async function handleMarkPaid(id: string) {
    await markPaid(id);
  }

  async function handleNewPayment() {
    if (!newPatientId || !newAmount) {
      showAlert(t("common.error"), t("payment.selectPatientAmount"));
      return;
    }
    await register({
      patientId: newPatientId,
      amount: parseFloat(newAmount),
      date: new Date(),
      frequency: newFrequency,
      invoiceStatus: newInvoiceStatus,
    });
    setNewAmount("");
    setNewInvoiceStatus(InvoiceStatus.PENDING);
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
              {p === "daily" ? t("calendar.today") : p === "weekly" ? t("calendar.week") : t("calendar.month")}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewForm(!showNewForm)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryAmt}>{formatCurrency(totalPaid)}</Text><Text style={styles.summaryLabel}>{t("payment.collected")}</Text></View>
        <View style={styles.summaryCard}><Text style={[styles.summaryAmt, { color: colors.danger }]}>{formatCurrency(totalPending)}</Text><Text style={styles.summaryLabel}>{t("payment.pending")}</Text></View>
      </View>

      {showNewForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t("payment.new")}</Text>
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
                  {f === PaymentFrequency.PER_SESSION ? t("patient.perSession") : f === PaymentFrequency.WEEKLY ? t("patient.weekly") : t("patient.monthly")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.invoiceLabel}>{t("payment.invoiceStatus")}</Text>
          <View style={styles.invoiceRow}>
            {[InvoiceStatus.PENDING, InvoiceStatus.ISSUED].map((inv) => (
              <TouchableOpacity
                key={inv} style={[styles.invoiceChip, newInvoiceStatus === inv && styles.invoiceChipActive]}
                onPress={() => setNewInvoiceStatus(inv)}
              >
                <Text style={[styles.chipText, newInvoiceStatus === inv && styles.chipTextActive]}>
                  {inv === InvoiceStatus.ISSUED ? t("payment.invoiceIssued") : t("payment.invoicePending")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.currencyLabel}>{currencySymbol()}</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
            </View>
            <TouchableOpacity style={styles.submitPaymentBtn} onPress={handleNewPayment}>
              <Text style={styles.submitPaymentText}>{t("payment.pay")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : payments.length === 0 ? (
        <Text style={styles.emptyText}>{t("payment.noPayments")}</Text>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.patientName}>{getPatientName(item.patientId)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status === "PAID" ? t("payment.paid") : item.status === "PENDING" ? t("payment.pending") : t("payment.overdue")}</Text>
                </View>
              </View>
              <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.paymentDate}>{formatDate(new Date(item.date))}</Text>
              <View style={styles.invoiceLine}>
                <View style={[styles.invoiceBadge, { backgroundColor: getInvoiceColor(item.invoiceStatus) }]}>
                  <Text style={styles.statusText}>
                    {item.invoiceStatus === "ISSUED" ? t("payment.invoiceIssued") : t("payment.invoicePending")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.invoiceToggleBtn}
                  onPress={() =>
                    setInvoiceStatus(item.id, item.invoiceStatus === "ISSUED" ? InvoiceStatus.PENDING : InvoiceStatus.ISSUED)
                  }
                >
                  <Text style={styles.invoiceToggleText}>
                    {item.invoiceStatus === "ISSUED" ? t("payment.markInvoicePending") : t("payment.markInvoiceIssued")}
                  </Text>
                </TouchableOpacity>
              </View>
              {item.status === "PENDING" && (
                <TouchableOpacity style={styles.payBtn} onPress={() => handleMarkPaid(item.id)}>
                  <Text style={styles.payBtnText}>{t("payment.markPaid")}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: radius.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  periodRow: { flexDirection: "row", padding: radius.md, gap: 8 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.surface, ...cardShadow },
  periodActive: { backgroundColor: colors.primary },
  periodText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  periodTextActive: { color: colors.white },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, justifyContent: "center", alignItems: "center", marginLeft: "auto" },
  addBtnText: { fontSize: 20, color: colors.white, fontWeight: "700" },
  summaryRow: { flexDirection: "row", paddingHorizontal: radius.md, gap: 8, marginBottom: 8 },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: radius.md, alignItems: "center", ...cardShadow },
  summaryAmt: { fontSize: 18, fontWeight: "700", color: colors.success },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  formCard: { backgroundColor: colors.surface, margin: radius.md, borderRadius: radius.md, padding: radius.lg, ...cardShadow },
  formTitle: { fontSize: 16, fontWeight: "700", marginBottom: radius.md, color: colors.text },
  patientChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surfaceMuted, marginRight: 6 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  freqRow: { flexDirection: "row", gap: 6, marginBottom: radius.md },
  freqChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surfaceMuted },
  invoiceLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  invoiceRow: { flexDirection: "row", gap: 6, marginBottom: radius.md },
  invoiceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surfaceMuted },
  invoiceChipActive: { backgroundColor: colors.primary },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currencyLabel: { fontSize: 18, fontWeight: "700", color: colors.text },
  amountInput: { backgroundColor: colors.surfaceSoft, borderRadius: radius.sm, paddingHorizontal: radius.md, paddingVertical: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text },
  submitPaymentBtn: { backgroundColor: colors.success, borderRadius: radius.sm, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 8 },
  submitPaymentText: { color: colors.white, fontWeight: "700" },
  emptyText: { textAlign: "center", color: colors.textMuted, marginTop: 40, fontSize: 15 },
  paymentCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 8, ...cardShadow },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientName: { fontWeight: "600", fontSize: 15, color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText: { color: colors.white, fontSize: 11, fontWeight: "600" },
  paymentAmount: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 4 },
  paymentDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  invoiceLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  invoiceBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  invoiceToggleBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  invoiceToggleText: { color: colors.primaryDark, fontSize: 12, fontWeight: "700" },
  payBtn: { marginTop: 8, backgroundColor: colors.success, borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  payBtnText: { color: colors.white, fontWeight: "600", fontSize: 13 },
});
