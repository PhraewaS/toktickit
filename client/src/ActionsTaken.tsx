import { FormEvent, useCallback, useEffect, useState } from "react";
import { ActionTaken, ActionTakenPayload, ApiError, createStaffAction, fetchRequesterActions, fetchStaffActions, updateStaffAction } from "./api.js";

function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function toInputDate(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); }
function initialDate() { return toInputDate(new Date().toISOString()); }
function newIdempotencyKey() { return crypto.randomUUID(); }

type Draft = { actionDateTime: string; description: string; result: string; followUpRequired: boolean; followUpNote: string; attachmentNotes: string };
type EditableField = "actionDateTime" | "description" | "result" | "followUpRequired" | "followUpNote" | "attachmentNotes";
const emptyDraft = (): Draft => ({ actionDateTime: initialDate(), description: "", result: "", followUpRequired: false, followUpNote: "", attachmentNotes: "" });
const fieldIds: Record<EditableField, string> = { actionDateTime: "action-date-time", description: "action-description", result: "action-result", followUpRequired: "action-follow-up-required", followUpNote: "action-follow-up-note", attachmentNotes: "action-attachment-notes" };

export default function ActionsTaken({ ticketId, readOnly = false }: { ticketId: number; readOnly?: boolean }) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [originalActionDateTime, setOriginalActionDateTime] = useState<string | null>(null);
  const [createOutcomeUnknown, setCreateOutcomeUnknown] = useState(false);

  const load = useCallback(async () => {
    setLoadState("loading");
    setFailure("");
    try {
      const loaded = readOnly ? await fetchRequesterActions(ticketId) : await fetchStaffActions(ticketId);
      setActions(loaded);
      setLoadState("ready");
      return true;
    } catch (error) {
      setLoadState(error instanceof ApiError && error.code === "ROLE_FORBIDDEN" ? "forbidden" : "error");
      setFailure(error instanceof Error ? error.message : "TokTickIT could not load Actions Taken. Please try again.");
      return false;
    }
  }, [readOnly, ticketId]);

  useEffect(() => { void load(); }, [load]);

  function resetForm() {
    setEditingId(null);
    setOriginalActionDateTime(null);
    setDraft(emptyDraft());
    setFormOpen(false);
    setFailure("");
    setFieldErrors({});
    setConflict(false);
    setCreateOutcomeUnknown(false);
  }

  async function discardDraft() {
    const mustReconcileCreate = createOutcomeUnknown;
    resetForm();
    setIdempotencyKey(newIdempotencyKey());
    if (mustReconcileCreate) await load();
  }

  function changeField(field: EditableField, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (failure) setFailure("");
  }

  function edit(action: ActionTaken) {
    setEditingId(action.id);
    setOriginalActionDateTime(action.actionDateTime);
    setDraft({ actionDateTime: toInputDate(action.actionDateTime), description: action.description, result: action.result, followUpRequired: action.followUpRequired, followUpNote: action.followUpNote ?? "", attachmentNotes: action.attachmentNotes ?? "" });
    setFailure("");
    setFieldErrors({});
    setConflict(false);
    setFormOpen(true);
  }

  async function refreshAfterConflict() {
    setFailure("");
    const refreshed = await load();
    if (refreshed) {
      setConflict(false);
      setFailure("Latest Actions Taken loaded. Your draft is still here; review it before saving or discard it if you no longer need it.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFailure("");
    setFieldErrors({});
    setConflict(false);
    const payload: ActionTakenPayload = {
      actionDateTime: originalActionDateTime !== null && draft.actionDateTime === toInputDate(originalActionDateTime)
        ? originalActionDateTime
        : new Date(draft.actionDateTime).toISOString(),
      description: draft.description,
      result: draft.result,
      followUpRequired: draft.followUpRequired,
      ...(draft.followUpRequired ? { followUpNote: draft.followUpNote } : {}),
      ...(draft.attachmentNotes ? { attachmentNotes: draft.attachmentNotes } : {}),
    };
    try {
      const current = actions.find((action) => action.id === editingId);
      if (editingId !== null && !current) throw new ApiError("This Action Taken is no longer available. Refresh and try again.", undefined, "ACTION_NOT_FOUND");
      const saved = editingId === null
        ? await createStaffAction(ticketId, payload, idempotencyKey)
        : await updateStaffAction(ticketId, editingId, { ...payload, updatedAt: current!.updatedAt });
      setActions((items) => {
        const next = editingId === null ? [...items, saved] : items.map((item) => item.id === saved.id ? saved : item);
        return next.sort((a, b) => a.actionDateTime.localeCompare(b.actionDateTime) || a.id - b.id);
      });
      resetForm();
      setIdempotencyKey(newIdempotencyKey());
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "TokTickIT could not save this Action Taken. Please try again.");
      if (editingId === null) {
        const definitiveRejection = error instanceof ApiError && ["VALIDATION_ERROR", "ROLE_FORBIDDEN", "TICKET_NOT_FOUND"].includes(error.code ?? "");
        setCreateOutcomeUnknown(!definitiveRejection);
      }
      if (error instanceof ApiError) {
        setFieldErrors(error.fields ?? {});
        setConflict(error.code === "ACTION_UPDATE_CONFLICT");
        if (error.code === "ROLE_FORBIDDEN") setLoadState("forbidden");
      }
    } finally {
      setSaving(false);
    }
  }

  function fieldError(field: EditableField) { return fieldErrors[field]; }
  function describedBy(field: EditableField) { return fieldError(field) ? `${fieldIds[field]}-error` : undefined; }

  return <section className="form-section actions-panel" aria-labelledby="actions-taken-heading" aria-busy={loadState === "loading"}>
    <div className="section-heading"><div><h2 id="actions-taken-heading">Actions Taken</h2><p>Operational work is recorded under this Ticket with the authenticated staff account.</p></div>{!readOnly && loadState === "ready" && !formOpen && <button className="button button--primary" type="button" onClick={() => { setDraft(emptyDraft()); setIdempotencyKey(newIdempotencyKey()); setOriginalActionDateTime(null); setFailure(""); setFieldErrors({}); setFormOpen(true); }}>Add Action Taken</button>}</div>
    {loadState === "loading" && <p className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading Actions Taken…</p>}
    {loadState === "forbidden" && <div className="state-panel state-panel--error" role="alert"><strong>Actions Taken are not available for this account.</strong><span>{failure || "No protected Action Taken information is being shown."}</span></div>}
    {loadState === "error" && <div className="state-panel state-panel--error" role="alert"><strong>Could not load Actions Taken.</strong><span>{failure}</span><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button>{formOpen && <span>Your draft is preserved. Retry loading or cancel the draft when you are ready.</span>}</div>}
    {loadState === "ready" && actions.length === 0 && !formOpen && <p className="state-panel" role="status">No Actions Taken have been recorded for this Ticket.</p>}
    {loadState === "ready" && actions.length > 0 && <ol className="action-list">{actions.map((action) => <li key={action.id} className="action-card"><div className="action-card__header"><div><strong><time dateTime={action.actionDateTime}>{formatDate(action.actionDateTime)}</time></strong><span>Performed by {action.performedBy.name}</span></div>{!readOnly && !formOpen && <button className="button button--tertiary" type="button" aria-label={`Edit Action Taken from ${formatDate(action.actionDateTime)}`} onClick={() => edit(action)}>Edit</button>}</div><dl className="action-details"><div><dt>Action Description</dt><dd>{action.description}</dd></div><div><dt>Result</dt><dd>{action.result}</dd></div><div><dt>Follow-Up Required?</dt><dd>{action.followUpRequired ? "Yes" : "No"}</dd></div>{action.followUpRequired && action.followUpNote && <div><dt>Follow-Up Note</dt><dd>{action.followUpNote}</dd></div>}{action.attachmentNotes && <div><dt>Attachment Notes</dt><dd>{action.attachmentNotes}</dd></div>}</dl></li>)}</ol>}
    {failure && loadState === "ready" && <div className={`state-panel${conflict || createOutcomeUnknown ? " state-panel--error" : ""}`} role={conflict || createOutcomeUnknown ? "alert" : "status"}><strong>{conflict ? "This Action Taken changed elsewhere." : createOutcomeUnknown ? "The save result may be unknown." : "Could not save Action Taken."}</strong><span>{failure}</span>{createOutcomeUnknown && <span>Keep this submitted draft unchanged and retry Save to safely confirm the outcome. The same request key is reused, preventing a duplicate.</span>}{conflict && <button className="button button--secondary" type="button" onClick={() => void refreshAfterConflict()}>Refresh Actions Taken</button>}</div>}
    {!readOnly && loadState !== "forbidden" && formOpen && <form className="action-editor" onSubmit={submit} aria-label={editingId === null ? "Create Action Taken" : "Edit Action Taken"}>
      <h3>{editingId === null ? "Add Action Taken" : "Edit Action Taken"}</h3>
      <div className="form-grid form-grid--two">
        <div className="field-group"><label htmlFor={fieldIds.actionDateTime}>Action Date/Time <span aria-hidden="true">*</span></label><input id={fieldIds.actionDateTime} type="datetime-local" value={draft.actionDateTime} onChange={(event) => changeField("actionDateTime", event.target.value)} disabled={saving || createOutcomeUnknown} required aria-invalid={Boolean(fieldError("actionDateTime"))} aria-describedby={describedBy("actionDateTime")} />{fieldError("actionDateTime") && <span className="field-error" id={describedBy("actionDateTime")}>{fieldError("actionDateTime")}</span>}</div>
        <div className="field-group"><label htmlFor="action-performed-by">Performed by</label><input id="action-performed-by" value="Authenticated IT Staff / Administrator" readOnly /></div>
      </div>
      <div className="field-group"><label htmlFor={fieldIds.description}>Action Description <span aria-hidden="true">*</span></label><textarea id={fieldIds.description} rows={3} value={draft.description} onChange={(event) => changeField("description", event.target.value)} disabled={saving || createOutcomeUnknown} maxLength={5000} required aria-invalid={Boolean(fieldError("description"))} aria-describedby={describedBy("description")} />{fieldError("description") && <span className="field-error" id={describedBy("description")}>{fieldError("description")}</span>}</div>
      <div className="field-group"><label htmlFor={fieldIds.result}>Result <span aria-hidden="true">*</span></label><textarea id={fieldIds.result} rows={3} value={draft.result} onChange={(event) => changeField("result", event.target.value)} disabled={saving || createOutcomeUnknown} maxLength={5000} required aria-invalid={Boolean(fieldError("result"))} aria-describedby={describedBy("result")} />{fieldError("result") && <span className="field-error" id={describedBy("result")}>{fieldError("result")}</span>}</div>
      <div className="field-group"><label className="checkbox-label" htmlFor={fieldIds.followUpRequired}><input id={fieldIds.followUpRequired} type="checkbox" checked={draft.followUpRequired} onChange={(event) => { changeField("followUpRequired", event.target.checked); if (!event.target.checked) setDraft((current) => ({ ...current, followUpNote: "" })); }} disabled={saving || createOutcomeUnknown} aria-invalid={Boolean(fieldError("followUpRequired"))} aria-describedby={describedBy("followUpRequired")} /> Follow-Up Required?</label>{fieldError("followUpRequired") && <span className="field-error" id={describedBy("followUpRequired")}>{fieldError("followUpRequired")}</span>}</div>
      {draft.followUpRequired && <div className="field-group"><label htmlFor={fieldIds.followUpNote}>Follow-Up Note <span aria-hidden="true">*</span></label><textarea id={fieldIds.followUpNote} rows={2} value={draft.followUpNote} onChange={(event) => changeField("followUpNote", event.target.value)} disabled={saving || createOutcomeUnknown} maxLength={5000} required aria-invalid={Boolean(fieldError("followUpNote"))} aria-describedby={describedBy("followUpNote")} />{fieldError("followUpNote") && <span className="field-error" id={describedBy("followUpNote")}>{fieldError("followUpNote")}</span>}</div>}
      <div className="field-group"><label htmlFor={fieldIds.attachmentNotes}>Attachment Notes</label><textarea id={fieldIds.attachmentNotes} rows={2} value={draft.attachmentNotes} onChange={(event) => changeField("attachmentNotes", event.target.value)} disabled={saving || createOutcomeUnknown} maxLength={2000} aria-invalid={Boolean(fieldError("attachmentNotes"))} aria-describedby={describedBy("attachmentNotes")} />{fieldError("attachmentNotes") && <span className="field-error" id={describedBy("attachmentNotes")}>{fieldError("attachmentNotes")}</span>}</div>
      <div className="form-actions"><button className="button button--primary" type="submit" disabled={saving || loadState !== "ready"}>{saving ? "Saving…" : editingId === null ? "Save Action Taken" : "Save Changes"}</button><button className="button button--tertiary" type="button" disabled={saving} onClick={() => void discardDraft()}>Discard draft</button></div>
    </form>}
  </section>;
}
