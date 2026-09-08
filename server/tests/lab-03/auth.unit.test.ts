import { describe, expect, it } from "vitest";
import { hashPassword, validatePassword, verifyPassword } from "../../src/auth.js";

describe("Lab 3 authentication primitives", () => {
  it("hashes and verifies passwords without storing plaintext", () => {
    const password = "Correct-Horse1!";
    const encoded = hashPassword(password, "test-salt");
    expect(encoded).toContain("scrypt$test-salt$");
    expect(encoded).not.toContain(password);
    expect(verifyPassword(password, encoded)).toBe(true);
    expect(verifyPassword("wrong-password", encoded)).toBe(false);
  });
  it("enforces the documented password boundaries", () => {
    expect(validatePassword("short")).toMatch(/12 and 128/);
    expect(validatePassword("alllowercase123")).toMatch(/upper-case/);
    expect(validatePassword("Correct-Horse1!")).toBeUndefined();
  });
});
