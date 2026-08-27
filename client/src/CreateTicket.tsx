import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Category,
  createTicket,
  DevelopmentRequester,
  fetchCategories,
  fetchRelatedSystems,
  RelatedSystem,
  RequestedPriority,
  Ticket,
} from "./api.js";

type ReferenceState = "loading" | "ready" | "error";
type FieldName =
  | "categoryId"
  | "relatedSystemId"
  | "requestedPriority"
  | "summary"
  | "description";

interface FormValues {
  categoryId: string;
  relatedSystemId: string;
  requestedPriority: "" | RequestedPriority;
  summary: string;
  description: string;
}

const EMPTY_FORM: FormValues = {
  categoryId: "",
  relatedSystemId: "",
  requestedPriority: "",
  summary: "",
  description: "",
};

function createSubmissionKey() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function validate(values: FormValues) {
  const errors: Partial<Record<FieldName, string>> = {};
  const summaryLength = values.summary.trim().length;
  const descriptionLength = values.description.trim().length;

  if (!values.categoryId) errors.categoryId = "Select a Category.";
  if (!values.relatedSystemId) {
    errors.relatedSystemId = "Select a Related System.";
  }
  if (!values.requestedPriority) {
    errors.requestedPriority = "Select a Requested Priority.";
  }
  if (summaryLength < 5 || summaryLength > 150) {
    errors.summary = "Summary must be between 5 and 150 characters.";
  }
  if (descriptionLength < 10 || descriptionLength > 5000) {
    errors.description = "Description must be between 10 and 5000 characters.";
  }

  return errors;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CreateTicket({
  requester,
}: {
  requester: DevelopmentRequester;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [referenceState, setReferenceState] =
    useState<ReferenceState>("loading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submissionKey] = useState(createSubmissionKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failure, setFailure] = useState("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  async function loadReferenceData() {
    setReferenceState("loading");
    setFailure("");
    try {
      const [loadedCategories, loadedRelatedSystems] = await Promise.all([
        fetchCategories(),
        fetchRelatedSystems(),
      ]);
      if (loadedCategories.length === 0 || loadedRelatedSystems.length === 0) {
        throw new Error("Required reference data is unavailable.");
      }
      setCategories(loadedCategories);
      setRelatedSystems(loadedRelatedSystems);
      setReferenceState("ready");
    } catch {
      setCategories([]);
      setRelatedSystems([]);
      setReferenceState("error");
    }
  }

  useEffect(() => {
    void loadReferenceData();
  }, [requester.id]);

  function updateValue(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || referenceState !== "ready") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0] as FieldName | undefined;
    if (firstInvalidField) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
        ?.focus();
      return;
    }

    setFailure("");
    setIsSubmitting(true);
    try {
      const result = await createTicket(requester.id, {
        submissionKey,
        categoryId: Number(values.categoryId),
        relatedSystemId: Number(values.relatedSystemId),
        summary: values.summary.trim(),
        requestedPriority: values.requestedPriority as RequestedPriority,
        description: values.description.trim(),
      });
      setCreatedTicket(result.data);
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "TokTickIT could not complete the request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(field: FieldName) {
    return errors[field] ? `${field}-error` : undefined;
  }

  return (
    <section className="ticket-page" aria-labelledby="create-ticket-heading">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Requester workspace</span>
          <h1 id="create-ticket-heading">Create Ticket</h1>
          <p className="lead-copy">
            Describe the IT problem. TokTickIT assigns the official Ticket Number
            after the backend saves it.
          </p>
        </div>
        <span className="status-badge">Status: New</span>
      </div>

      <div className="development-notice" role="note">
        Development Requester context is for Lab 2 testing only and is not
        authentication.
      </div>

      {createdTicket && (
        <div className="success-panel" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Ticket created successfully.</strong>
            <span>
              Official Ticket Number: <b>{createdTicket.ticketNumber}</b>
            </span>
          </div>
        </div>
      )}

      {failure && (
        <div className="state-panel state-panel--error" role="alert">
          <strong>Ticket was not created.</strong>
          <span>{failure}</span>
        </div>
      )}

      {referenceState === "loading" && (
        <div className="state-panel" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Loading Categories and Related Systems…
        </div>
      )}

      {referenceState === "error" && (
        <div className="state-panel state-panel--error" role="alert">
          <strong>Could not load Ticket reference data.</strong>
          <span>Please check the API connection and try again.</span>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void loadReferenceData()}
          >
            Try again
          </button>
        </div>
      )}

      <form ref={formRef} className="ticket-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="form-section read-only-section">
          <legend>Ticket context</legend>
          <p>These values are assigned by TokTickIT and cannot be edited.</p>
          <div className="form-grid form-grid--four">
            <div className="field-group">
              <label htmlFor="ticket-number">Ticket Number</label>
              <input
                id="ticket-number"
                value={createdTicket?.ticketNumber ?? "Generated after submission"}
                readOnly
              />
            </div>
            <div className="field-group">
              <label htmlFor="ticket-date">Ticket Date</label>
              <input
                id="ticket-date"
                value={
                  createdTicket
                    ? formatDate(createdTicket.ticketDate)
                    : "Assigned on submission"
                }
                readOnly
              />
            </div>
            <div className="field-group">
              <label htmlFor="requester">Requester</label>
              <input id="requester" value={requester.name} readOnly />
            </div>
            <div className="field-group">
              <label htmlFor="current-status">Current Status</label>
              <input id="current-status" value="New" readOnly />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section" disabled={isSubmitting || !!createdTicket}>
          <legend>Classification</legend>
          <div className="form-grid form-grid--three">
            <div className="field-group">
              <label htmlFor="category">
                Category <span aria-hidden="true">*</span>
              </label>
              <select
                id="category"
                name="categoryId"
                value={values.categoryId}
                onChange={(event) => updateValue("categoryId", event.target.value)}
                disabled={referenceState !== "ready"}
                aria-invalid={!!errors.categoryId}
                aria-describedby={fieldError("categoryId")}
              >
                <option value="">Select a Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="field-error" id="categoryId-error">
                  {errors.categoryId}
                </span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="related-system">
                Related System <span aria-hidden="true">*</span>
              </label>
              <select
                id="related-system"
                name="relatedSystemId"
                value={values.relatedSystemId}
                onChange={(event) =>
                  updateValue("relatedSystemId", event.target.value)
                }
                disabled={referenceState !== "ready"}
                aria-invalid={!!errors.relatedSystemId}
                aria-describedby={fieldError("relatedSystemId")}
              >
                <option value="">Select a Related System</option>
                {relatedSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
              {errors.relatedSystemId && (
                <span className="field-error" id="relatedSystemId-error">
                  {errors.relatedSystemId}
                </span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="requested-priority">
                Requested Priority <span aria-hidden="true">*</span>
              </label>
              <select
                id="requested-priority"
                name="requestedPriority"
                value={values.requestedPriority}
                onChange={(event) =>
                  updateValue("requestedPriority", event.target.value)
                }
                aria-invalid={!!errors.requestedPriority}
                aria-describedby={fieldError("requestedPriority")}
              >
                <option value="">Select a Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              {errors.requestedPriority && (
                <span className="field-error" id="requestedPriority-error">
                  {errors.requestedPriority}
                </span>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section" disabled={isSubmitting || !!createdTicket}>
          <legend>Problem details</legend>
          <div className="field-group">
            <label htmlFor="summary">
              Ticket Summary <span aria-hidden="true">*</span>
            </label>
            <input
              id="summary"
              name="summary"
              value={values.summary}
              maxLength={150}
              onChange={(event) => updateValue("summary", event.target.value)}
              aria-invalid={!!errors.summary}
              aria-describedby={fieldError("summary") ?? "summary-help"}
            />
            {errors.summary ? (
              <span className="field-error" id="summary-error">
                {errors.summary}
              </span>
            ) : (
              <span className="field-help" id="summary-help">
                5–150 characters
              </span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="description">
              Description <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              maxLength={5000}
              rows={7}
              onChange={(event) => updateValue("description", event.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby={fieldError("description") ?? "description-help"}
            />
            {errors.description ? (
              <span className="field-error" id="description-error">
                {errors.description}
              </span>
            ) : (
              <span className="field-help" id="description-help">
                10–5000 characters. Include the impact and what you already tried.
              </span>
            )}
          </div>
        </fieldset>

        <div className="form-actions">
          <p>Fields marked with * are required.</p>
          <button
            className="button button--primary"
            type="submit"
            disabled={referenceState !== "ready" || isSubmitting || !!createdTicket}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              "Submit Ticket"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
