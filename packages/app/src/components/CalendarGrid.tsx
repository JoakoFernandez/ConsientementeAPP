import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getMonthDays, isSameDay, isSameMonth } from "../utils/date";
import { colors, radius } from "../theme";

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  sessionDates?: string[];
  paymentDates?: string[];
  holidays?: Record<string, string>;
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  sessionDates = [],
  paymentDates = [],
  holidays = {},
}: CalendarGridProps) {
  const days = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const today = new Date();

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
          const isToday = isSameDay(day, today);
          const dateStr = day.toISOString().split("T")[0];
          const hasSession = sessionDates.includes(dateStr);
          const hasPayment = paymentDates.includes(dateStr);
          const isHoliday = holidays[dateStr] != null;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDay,
                !inMonth && styles.otherMonth,
                isHoliday && styles.holidayDay,
                isToday && styles.todayDay,
              ]}
              onPress={() => onSelectDate(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText, !inMonth && styles.otherMonthText, isHoliday && !isSelected && styles.holidayDayText]}>
                {day.getDate()}
              </Text>
              <View style={styles.dotRow}>
                {hasSession && <View style={[styles.dot, styles.sessionDot]} />}
                {hasPayment && <View style={[styles.dot, styles.paymentDot]} />}
                {isHoliday && <View style={[styles.dot, styles.holidayDot]} />}
                {isWeekend && !isHoliday && !hasSession && !hasPayment && <View style={[styles.dot, styles.weekendDot]} />}
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
  weekdayText: { fontWeight: "600", fontSize: 12, color: colors.textSecondary, width: "14.28%", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    padding: 2,
  },
  selectedDay: { backgroundColor: colors.primary },
  otherMonth: { opacity: 0.35 },
  holidayDay: { backgroundColor: colors.dangerLight },
  todayDay: { borderWidth: 1, borderColor: colors.primary },
  dayText: { fontSize: 14, fontWeight: "500", color: colors.text },
  selectedDayText: { color: colors.white, fontWeight: "700" },
  otherMonthText: { color: colors.textMuted },
  holidayDayText: { color: colors.dangerText },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sessionDot: { backgroundColor: colors.info },
  paymentDot: { backgroundColor: colors.success },
  holidayDot: { backgroundColor: colors.danger },
  weekendDot: { backgroundColor: colors.border },
});
