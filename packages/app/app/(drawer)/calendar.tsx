import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useCalendarStore } from "../../src/stores/calendarStore";
import { useSessionStore } from "../../src/stores/sessionStore";
import { usePatientStore } from "../../src/stores/patientStore";
import { CalendarGrid } from "../../src/components/CalendarGrid";
import { DateDetailPanel } from "../../src/components/DateDetailPanel";
import { t } from "../../src/i18n";

export default function Calendar() {
  const { selectedDate, currentMonth, setSelectedDate, goToPrevMonth, goToNextMonth, goToToday } = useCalendarStore();
  const { sessions, loadByRange: loadSessions } = useSessionStore();
  const { patients, load: loadPatients } = usePatientStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  async function loadMonthData() {
    setLoading(true);
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    await Promise.all([loadPatients(), loadSessions(start, end)]);
    setLoading(false);
  }

  const monthSessionDates = sessions.map((s) => new Date(s.date).toISOString().split("T")[0]);
  const selectedDateSessions = sessions.filter((s) => {
    const d = new Date(s.date);
    return d.toDateString() === selectedDate.toDateString();
  });

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre"];

  return (
    <View style={styles.container}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth}><Text style={styles.navBtn}>{"<"}</Text></TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth}><Text style={styles.navBtn}>{">"}</Text></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
      ) : (
        <>
          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            sessionDates={monthSessionDates}
          />
          <ScrollView style={styles.detailScroll}>
            <DateDetailPanel
              date={selectedDate}
              sessions={selectedDateSessions}
              patients={patients}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  monthNav: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#f5f5f5",
  },
  navBtn: { fontSize: 24, fontWeight: "700", color: "#4A90D9", paddingHorizontal: 10 },
  monthTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  detailScroll: { flex: 1 },
});
