import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Lab 3 Zen Green style contract", () => {
  it("keeps role and private-note tokens in the shared stylesheet", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    expect(styles).toContain(".badge--role");
    expect(styles).toContain(".internal-note-panel");
  });
});
