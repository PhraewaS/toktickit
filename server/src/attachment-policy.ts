import path from "node:path";

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ACTIVE_ATTACHMENTS = 5;

export const ALLOWED_ATTACHMENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
} as const;

export type AttachmentValidationError =
  | "UNSUPPORTED_ATTACHMENT_TYPE"
  | "ATTACHMENT_TOO_LARGE";

export function sanitizeOriginalFilename(filename: string) {
  const basename = path.win32.basename(filename.replaceAll("/", "\\"));
  const withoutControls = basename.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return withoutControls || "attachment";
}

export function validateAttachment(file: {
  originalname: string;
  mimetype: string;
  size: number;
}) {
  if (file.size < 1 || file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false as const,
      code: "ATTACHMENT_TOO_LARGE" as const,
      message: "Each attachment must be between 1 byte and 5 MiB.",
    };
  }

  const filename = sanitizeOriginalFilename(file.originalname);
  const extension = path.extname(filename).toLowerCase() as keyof typeof ALLOWED_ATTACHMENT_TYPES;
  const expectedMime = ALLOWED_ATTACHMENT_TYPES[extension];
  if (!expectedMime || expectedMime !== file.mimetype) {
    return {
      ok: false as const,
      code: "UNSUPPORTED_ATTACHMENT_TYPE" as const,
      message: "Only JPG, JPEG, PNG, WEBP, and PDF files are supported.",
    };
  }

  return {
    ok: true as const,
    originalFilename: filename,
    mimeType: expectedMime,
  };
}

export function validateRemovalReason(value: unknown) {
  if (typeof value !== "string") return null;
  const reason = value.trim();
  return reason.length >= 3 && reason.length <= 500 ? reason : null;
}
