import { create } from "zustand";

interface CalendarState {
  selectedDate: Date;
  currentMonth: Date;
  setSelectedDate: (date: Date) => void;
  setCurrentMonth: (month: Date) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  setCurrentMonth: (month: Date) => set({ currentMonth: month }),
  goToPrevMonth: () =>
    set((state) => {
      const m = new Date(state.currentMonth);
      m.setMonth(m.getMonth() - 1);
      return { currentMonth: m };
    }),
  goToNextMonth: () =>
    set((state) => {
      const m = new Date(state.currentMonth);
      m.setMonth(m.getMonth() + 1);
      return { currentMonth: m };
    }),
  goToToday: () =>
    set({ selectedDate: new Date(), currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }),
}));
