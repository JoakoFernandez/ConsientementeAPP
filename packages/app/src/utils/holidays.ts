import { getLanguage } from "../i18n";
import { WeekDay } from "@consientemente/core";

export interface HolidayInfo {
  date: Date;
  name: string;
}

interface HolidaySpec {
  month: number;
  day: number;
  names: { es: string; en: string; it: string };
}

const FIXED_HOLIDAYS: HolidaySpec[] = [
  { month: 0, day: 1, names: { es: "Año Nuevo", en: "New Year's Day", it: "Capodanno" } },
  { month: 2, day: 24, names: { es: "Día de la Memoria por la Verdad y la Justicia", en: "Day of Remembrance for Truth and Justice", it: "Giorno della Memoria per la Verità e la Giustizia" } },
  { month: 3, day: 2, names: { es: "Día del Veterano y de los Caídos en Malvinas", en: "Malvinas Veterans Day", it: "Giornata dei Veterani delle Malvinas" } },
  { month: 4, day: 1, names: { es: "Día del Trabajador", en: "Labour Day", it: "Festa del Lavoro" } },
  { month: 4, day: 25, names: { es: "Día de la Revolución de Mayo", en: "May Revolution Day", it: "Rivoluzione di Maggio" } },
  { month: 5, day: 20, names: { es: "Día de la Bandera", en: "Flag Day", it: "Giorno della Bandiera" } },
  { month: 6, day: 9, names: { es: "Día de la Independencia", en: "Independence Day", it: "Giorno dell'Indipendenza" } },
  { month: 9, day: 12, names: { es: "Día del Respeto a la Diversidad Cultural", en: "Day of Respect for Cultural Diversity", it: "Giorno del Rispetto per la Diversità Culturale" } },
  { month: 10, day: 20, names: { es: "Día de la Soberanía Nacional", en: "National Sovereignty Day", it: "Giorno della Sovranità Nazionale" } },
  { month: 11, day: 8, names: { es: "Día de la Inmaculada Concepción", en: "Immaculate Conception", it: "Immacolata Concezione" } },
  { month: 11, day: 25, names: { es: "Navidad", en: "Christmas Day", it: "Natale" } },
];

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function daysBeforeEaster(year: number, offset: number): Date {
  const e = easterSunday(year);
  return new Date(year, e.getMonth(), e.getDate() - offset);
}

export function getHolidays(year: number): HolidayInfo[] {
  const lang = getLanguage();
  const holidays: HolidayInfo[] = FIXED_HOLIDAYS.map((h) => ({
    date: new Date(year, h.month, h.day),
    name: h.names[lang],
  }));

  const carnavalMonday = daysBeforeEaster(year, 48);
  holidays.push({
    date: carnavalMonday,
    name: lang === "es" ? "Carnaval" : lang === "en" ? "Carnival" : "Carnevale",
  });
  const carnavalTuesday = daysBeforeEaster(year, 47);
  holidays.push({
    date: carnavalTuesday,
    name: lang === "es" ? "Carnaval" : lang === "en" ? "Carnival" : "Carnevale",
  });
  holidays.push({
    date: daysBeforeEaster(year, 3),
    name: lang === "es" ? "Jueves Santo" : lang === "en" ? "Maundy Thursday" : "Giovedì Santo",
  });
  holidays.push({
    date: daysBeforeEaster(year, 2),
    name: lang === "es" ? "Viernes Santo" : lang === "en" ? "Good Friday" : "Venerdì Santo",
  });

  return holidays;
}

export function getHoliday(date: Date): HolidayInfo | null {
  const year = date.getFullYear();
  const dateKey = `${date.getMonth()}-${date.getDate()}`;
  return getHolidays(year).find(
    (h) => `${h.date.getMonth()}-${h.date.getDate()}` === dateKey
  ) ?? null;
}

export function getHolidaysForRange(from: Date, to: Date): Record<string, string> {
  const result: Record<string, string> = {};
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    for (const h of getHolidays(y)) {
      if (h.date >= from && h.date <= to) {
        const key = h.date.toISOString().split("T")[0];
        result[key] = h.name;
      }
    }
  }
  return result;
}

export function getWeekDay(date: Date): WeekDay {
  const map: WeekDay[] = [
    WeekDay.SUNDAY,
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
  ];
  return map[date.getDay()];
}
