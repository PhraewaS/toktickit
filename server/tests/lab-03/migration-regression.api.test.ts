import { describe, expect, it } from "vitest";
import { hashPassword } from "../../src/auth.js";

describe("Lab 2 to Lab 3 migration contract", () => {
  it("uses a salted hash for migrated initial credentials", () => {
    const migrated = hashPassword("Lab3-ChangeMe1!", "lab3-migration-salt");
    expect(migrated).toMatch(/^scrypt\$lab3-migration-salt\$[0-9a-f]{64}$/);
  });
});
