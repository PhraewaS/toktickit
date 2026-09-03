import { describe, expect, it } from "vitest";
import { formatTicketNumber } from "../../src/ticket-number.js";

describe("Ticket Number formatting", () => {
  it("uses the UTC creation date and an uppercase eight-character hexadecimal suffix", () => {
    expect(
      formatTicketNumber(new Date("2026-08-24T23:59:59.000-07:00"), "a1b2c3d4"),
    ).toBe("TKT-20260825-A1B2C3D4");
  });

  it("produces different Ticket Numbers for different random inputs", () => {
    const createdAt = new Date("2026-08-24T08:30:00.000Z");

    expect(formatTicketNumber(createdAt, "00000001")).not.toBe(
      formatTicketNumber(createdAt, "00000002"),
    );
  });

  it("rejects a suffix that is not exactly eight hexadecimal characters", () => {
    expect(() =>
      formatTicketNumber(new Date("2026-08-24T08:30:00.000Z"), "not-hex"),
    ).toThrow(/eight hexadecimal/i);
  });
});
