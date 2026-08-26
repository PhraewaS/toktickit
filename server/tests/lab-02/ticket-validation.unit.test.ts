import { describe, expect, it } from "vitest";
import { validateCreateTicketInput } from "../../src/ticket-validation.js";

const validInput = {
  submissionKey: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  categoryId: 2,
  relatedSystemId: 7,
  summary: "  Laptop battery drains quickly  ",
  requestedPriority: "MEDIUM",
  description:
    "  The battery falls from full charge to 20 percent within one hour.  ",
};

describe("Create Ticket validation", () => {
  it("accepts the contract shape and trims Summary and Description", () => {
    const result = validateCreateTicketInput(validInput);

    expect(result).toEqual({
      success: true,
      data: {
        ...validInput,
        summary: "Laptop battery drains quickly",
        description:
          "The battery falls from full charge to 20 percent within one hour.",
      },
    });
  });

  it("accepts the inclusive Summary and Description boundaries", () => {
    const minimum = validateCreateTicketInput({
      ...validInput,
      summary: "12345",
      description: "1234567890",
    });
    const maximum = validateCreateTicketInput({
      ...validInput,
      summary: "s".repeat(150),
      description: "d".repeat(5000),
    });

    expect(minimum.success).toBe(true);
    expect(maximum.success).toBe(true);
  });

  it("returns field details for missing, malformed, or out-of-range values", () => {
    const result = validateCreateTicketInput({
      submissionKey: "not-a-uuid",
      categoryId: 0,
      relatedSystemId: "7",
      summary: "  tiny  ",
      requestedPriority: "URGENT",
      description: " short ",
    });

    expect(result).toEqual({
      success: false,
      fields: expect.objectContaining({
        submissionKey: expect.any(String),
        categoryId: expect.any(String),
        relatedSystemId: expect.any(String),
        summary: expect.any(String),
        requestedPriority: expect.any(String),
        description: expect.any(String),
      }),
    });
  });

  it("rejects server-generated fields supplied by a client", () => {
    const result = validateCreateTicketInput({
      ...validInput,
      requesterId: 99,
      ticketNumber: "TKT-20260824-DEADBEEF",
      ticketDate: "2026-08-24T08:30:00.000Z",
      currentStatus: "NEW",
    });

    expect(result).toEqual({
      success: false,
      fields: expect.objectContaining({
        requesterId: expect.any(String),
        ticketNumber: expect.any(String),
        ticketDate: expect.any(String),
        currentStatus: expect.any(String),
      }),
    });
  });
});
