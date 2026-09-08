import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Lab 3 Zen Green style contract", () => { it("keeps role and private-note tokens in the shared stylesheet", () => { const css = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8"); expect(css).toContain(".badge--role"); expect(css).toContain(".internal-note-panel"); }); });
