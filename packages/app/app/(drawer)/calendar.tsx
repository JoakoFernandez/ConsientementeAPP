import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SessionStatus, Patient } from "@consientemente/core";
import { useCalendarStore } from "../../src/stores/calendarStore";
import { useSessionStore } from "../../src/stores/sessionStore";
import { usePatientStore } from "../../src/stores/patientStore";
import { CalendarGrid } from "../../src/components/CalendarGrid";
import { DateDetailPanel } from "../../src/components/DateDetailPanel";
import { t } from "../../src/i18n";
import { getMonthNames } from "../../src/utils/date";
import { getHolidaysForRange, getHoliday, getWeekDay } from "../../src/utils/holidays";
import { colors, radius } from "../../src/theme";

const DEFAULT_DURATION = 50;

export default function Calendar() {
  const { selectedDate, currentMonth, setSelectedDate, setCurrentMonth, goToPrevMonth, goToNextMonth, goToToday } = useCalendarStore();
  const { sessions, loadByRange: loadSessions, schedule, setStatus, remove } = useSessionStore();
  const { patients, load: loadPatients } = usePatientStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear()) return;
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  async function loadMonthData() {
    setLoading(true);
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    await Promise.all([loadPatients(), loadSessions(start, end)]);
    ensureScheduleSessions();
    setLoading(false);
  }

  const selectedHoliday = getHoliday(selectedDate);

  async function ensureScheduleSessions() {
    // Auto-materialize a session for each active patient whose regular schedule
    // falls on the selected weekday, so schedule-based patients appear as part of
    // "patients of the day". Skipped on holidays (user adds them manually with a warning).
    if (selectedHoliday) return;
    const dayWeekDay = getWeekDay(selectedDate);
    const daySessions = sessions.filter(
      (s) => new Date(s.date).toDateString() === selectedDate.toDateString()
    );
    const existingKeys = new Set(
      daySessions.map((s) => {
        const d = new Date(s.date);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${s.patientId}|${hh}:${mm}`;
      })
    );
    const toCreate: { patient: Patient; time: string }[] = [];
    for (const p of patients) {
      if (!p.isActive) continue;
      for (const sc of p.regularSchedules) {
        if (sc.weekDay !== dayWeekDay) continue;
        const key = `${p.id}|${sc.time}`;
        if (!existingKeys.has(key)) toCreate.push({ patient: p, time: sc.time });
      }
    }
    for (const { patient, time } of toCreate) {
      const date = new Date(selectedDate);
      const [h, m] = time.split(":").map((n) => parseInt(n, 10));
      date.setHours(h || 9, m || 0, 0, 0);
      await schedule({
        patientId: patient.id,
        date,
        duration: DEFAULT_DURATION,
        status: SessionStatus.WAITING_CONFIRMATION,
      });
    }
  }

  useEffect(() => {
    if (loading) return;
    if (selectedDate.getMonth() !== currentMonth.getMonth()) return;
    ensureScheduleSessions();
  }, [selectedDate]);

  const monthSessionDates = sessions.map((s) => new Date(s.date).toISOString().split("T")[0]);
  const holidays = getHolidaysForRange(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  );

  const selectedDateSessions = sessions.filter((s) => {
    const d = new Date(s.date);
    return d.toDateString() === selectedDate.toDateString();
  });

  async function addPatient(patient: Patient, time?: string) {
    const confirm = (confirmed: boolean) => {
      const date = new Date(selectedDate);
      const t = time ?? patient.regularSchedules?.[0]?.time ?? `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      const [h, m] = t.split(":").map((n) => parseInt(n, 10));
      date.setHours(h || 9, m || 0, 0, 0);
      schedule({
        patientId: patient.id,
        date,
        duration: DEFAULT_DURATION,
        status: confirmed ? SessionStatus.CONFIRMED : SessionStatus.WAITING_CONFIRMATION,
      });
    };

    if (selectedHoliday) {
      Alert.alert(
        t("calendar.holiday"),
        t("calendar.holidayWarning", { name: selectedHoliday.name }),
        [
          { text: t("calendar.cancelHolidayAdd"), style: "cancel" },
          { text: t("calendar.confirmHolidayAdd"), onPress: () => confirm(false) },
        ]
      );
    } else {
      confirm(false);
    }
  }

  const monthNames = getMonthNames();

  return (
    <View style={styles.container}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navTouch}>
          <Text style={styles.navBtn}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday} style={styles.monthTouch}>
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navTouch}>
          <Text style={styles.navBtn}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            sessionDates={monthSessionDates}
            holidays={holidays}
          />
          <ScrollView style={styles.detailScroll}>
            <DateDetailPanel
              date={selectedDate}
              sessions={selectedDateSessions}
              patients={patients}
              holiday={selectedHoliday?.name ?? null}
              onAddPatient={addPatient}
              onRemovePatient={(s) => remove(s.id)}
              onToggleStatus={(s, status) => setStatus(s.id, status)}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  monthNav: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: radius.md, backgroundColor: colors.surfaceMuted,
  },
  navTouch: { paddingHorizontal: 6 },
  navBtn: { fontSize: 24, fontWeight: "700", color: colors.primary, paddingHorizontal: 10 },
  monthTouch: { paddingVertical: 4 },
  monthTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  detailScroll: { flex: 1 },
});
