import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getMonthDays, isSameDay, isSameMonth } from "../utils/date";

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  sessionDates?: string[];
  paymentDates?: string[];
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  sessionDates = [],
  paymentDates = [],
}: CalendarGridProps) {
  const days = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekdayText}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, currentMonth);
          const dateStr = day.toISOString().split("T")[0];
          const hasSession = sessionDates.includes(dateStr);
          const hasPayment = paymentDates.includes(dateStr);

          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayCell, isSelected && styles.selectedDay, !inMonth && styles.otherMonth]}
              onPress={() => onSelectDate(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {day.getDate()}
              </Text>
              <View style={styles.dotRow}>
                {hasSession && <View style={[styles.dot, styles.sessionDot]} />}
                {hasPayment && <View style={[styles.dot, styles.paymentDot]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  weekdayRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  weekdayText: { fontWeight: "600", fontSize: 12, color: "#666", width: "14.28%", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 2,
  },
  selectedDay: { backgroundColor: "#4A90D9" },
  otherMonth: { opacity: 0.3 },
  dayText: { fontSize: 14, fontWeight: "500" },
  selectedDayText: { color: "#fff", fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sessionDot: { backgroundColor: "#3498db" },
  paymentDot: { backgroundColor: "#27ae60" },
});
