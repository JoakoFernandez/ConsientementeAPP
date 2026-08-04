import React from "react";
import { useRouter } from "expo-router";
import { usePatientStore } from "../../../src/stores/patientStore";
import { PatientForm, PatientFormData } from "../../../src/components/PatientForm";

export default function NewPatient() {
  const router = useRouter();
  const { create } = usePatientStore();

  async function handleSubmit(data: PatientFormData) {
    await create(data);
    router.back();
  }

  return <PatientForm onSubmit={handleSubmit} />;
}