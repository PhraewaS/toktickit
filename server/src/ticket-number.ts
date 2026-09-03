import { randomBytes } from "node:crypto";

const HEX_SUFFIX = /^[A-F0-9]{8}$/;

export function formatTicketNumber(createdAt: Date, hexadecimalSuffix: string) {
  const suffix = hexadecimalSuffix.toUpperCase();
  if (!HEX_SUFFIX.test(suffix)) {
    throw new Error("Ticket Number suffix must be exactly eight hexadecimal characters.");
  }

  const year = createdAt.getUTCFullYear();
  const month = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getUTCDate()).padStart(2, "0");
  return `TKT-${year}${month}${day}-${suffix}`;
}

export function generateTicketNumber(createdAt = new Date()) {
  return formatTicketNumber(createdAt, randomBytes(4).toString("hex"));
}
