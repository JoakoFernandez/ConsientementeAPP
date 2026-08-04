import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PatientForm, PatientFormData } from "../../../src/components/PatientForm";
import { t } from "../../../src/i18n";
import { colors } from "../../../src/theme";

export default function EditPatient() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, update } = usePatientStore();
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const p = await getById(id);
      setInitial(p);
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit(data: PatientFormData) {
    await update({ id, data });
    router.back();
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!initial) {
    return <View style={styles.center}><Text style={styles.notFound}>{t("patient.notFound")}</Text></View>;
  }

  return <PatientForm initial={initial} onSubmit={handleSubmit} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.surface },
  notFound: { color: colors.textSecondary, fontSize: 16 },
});