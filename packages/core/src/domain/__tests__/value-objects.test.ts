import { describe, it, expect } from "vitest";
import { PaymentFrequency } from "../value-objects/PaymentFrequency";
import { PatientAgeCategory } from "../value-objects/PatientAgeCategory";
import { SessionStatus } from "../value-objects/SessionStatus";
import { PaymentStatus } from "../value-objects/PaymentStatus";
import { WeekDay } from "../value-objects/WeekDay";

describe("PaymentFrequency", () => {
  it("has PER_SESSION value", () => {
    expect(PaymentFrequency.PER_SESSION).toBe("PER_SESSION");
  });
  it("has WEEKLY value", () => {
    expect(PaymentFrequency.WEEKLY).toBe("WEEKLY");
  });
  it("has MONTHLY value", () => {
    expect(PaymentFrequency.MONTHLY).toBe("MONTHLY");
  });
  it("has exactly 3 values", () => {
    expect(Object.keys(PaymentFrequency).length).toBe(3);
  });
});

describe("PatientAgeCategory", () => {
  it("has MINOR value", () => {
    expect(PatientAgeCategory.MINOR).toBe("MINOR");
  });
  it("has ADULT value", () => {
    expect(PatientAgeCategory.ADULT).toBe("ADULT");
  });
});

describe("SessionStatus", () => {
  it("has SCHEDULED value", () => {
    expect(SessionStatus.SCHEDULED).toBe("SCHEDULED");
  });
  it("has COMPLETED value", () => {
    expect(SessionStatus.COMPLETED).toBe("COMPLETED");
  });
  it("has CANCELLED value", () => {
    expect(SessionStatus.CANCELLED).toBe("CANCELLED");
  });
});

describe("PaymentStatus", () => {
  it("has PENDING value", () => {
    expect(PaymentStatus.PENDING).toBe("PENDING");
  });
  it("has PAID value", () => {
    expect(PaymentStatus.PAID).toBe("PAID");
  });
  it("has OVERDUE value", () => {
    expect(PaymentStatus.OVERDUE).toBe("OVERDUE");
  });
});

describe("WeekDay", () => {
  it("has all 7 days", () => {
    expect(Object.keys(WeekDay).length).toBe(7);
  });
  it("has MONDAY", () => expect(WeekDay.MONDAY).toBe("MONDAY"));
  it("has TUESDAY", () => expect(WeekDay.TUESDAY).toBe("TUESDAY"));
  it("has WEDNESDAY", () => expect(WeekDay.WEDNESDAY).toBe("WEDNESDAY"));
  it("has THURSDAY", () => expect(WeekDay.THURSDAY).toBe("THURSDAY"));
  it("has FRIDAY", () => expect(WeekDay.FRIDAY).toBe("FRIDAY"));
  it("has SATURDAY", () => expect(WeekDay.SATURDAY).toBe("SATURDAY"));
  it("has SUNDAY", () => expect(WeekDay.SUNDAY).toBe("SUNDAY"));
});
