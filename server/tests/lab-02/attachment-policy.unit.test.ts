import { describe, expect, it } from "vitest";
import {
  MAX_ATTACHMENT_BYTES,
  sanitizeOriginalFilename,
  validateAttachment,
  validateRemovalReason,
} from "../../src/attachment-policy.js";

describe("Attachment policy", () => {
  it("accepts permitted MIME/extension pairs at the size boundary", () => {
    expect(validateAttachment({
      originalname: "C:\\private\\report.PDF",
      mimetype: "application/pdf",
      size: MAX_ATTACHMENT_BYTES,
    })).toMatchObject({ ok: true, originalFilename: "report.PDF" });
  });

  it("rejects mismatched types and oversized files", () => {
    expect(validateAttachment({ originalname: "report.pdf", mimetype: "image/png", size: 10 })).toMatchObject({ ok: false, code: "UNSUPPORTED_ATTACHMENT_TYPE" });
    expect(validateAttachment({ originalname: "report.png", mimetype: "image/png", size: MAX_ATTACHMENT_BYTES + 1 })).toMatchObject({ ok: false, code: "ATTACHMENT_TOO_LARGE" });
  });

  it("sanitizes user paths and validates removal reasons", () => {
    expect(sanitizeOriginalFilename("../../secret.txt")).toBe("secret.txt");
    expect(validateRemovalReason("  wrong file  ")).toBe("wrong file");
    expect(validateRemovalReason("ab")).toBeNull();
    expect(validateRemovalReason("abc")).toBe("abc");
    expect(validateRemovalReason("a".repeat(500))).toHaveLength(500);
    expect(validateRemovalReason("a".repeat(501))).toBeNull();
  });
});
