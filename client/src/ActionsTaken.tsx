import { FormEvent, useEffect, useState } from "react";
import { ActionTaken, ActionTakenPayload, createStaffAction, updateStaffAction } from "./api.js";

function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function toInputDate(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); }
function initialDate() { return toInputDate(new Date().toISOString()); }

type Draft = { actionDateTime: string; description: string; result: string; followUpRequired: boolean; followUpNote: string; attachmentNotes: string };
const emptyDraft = (): Draft => ({ actionDateTime: initialDate(), description: "", result: "", followUpRequired: false, followUpNote: "", attachmentNotes: "" });
const EMPTY_ACTIONS: ActionTaken[] = [];

export default function ActionsTaken({ ticketId, initialActions = EMPTY_ACTIONS, readOnly = false }: { ticketId: number; initialActions?: ActionTaken[]; readOnly?: boolean }) {
  const [actions, setActions] = useState(initialActions);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "editing" | "saving">("idle");
  const [failure, setFailure] = useState("");

  useEffect(() => setActions(initialActions), [initialActions]);

  function edit(action: ActionTaken) { setEditingId(action.id); setDraft({ actionDateTime: toInputDate(action.actionDateTime), description: action.description, result: action.result, followUpRequired: action.followUpRequired, followUpNote: action.followUpNote ?? "", attachmentNotes: action.attachmentNotes ?? "" }); setFailure(""); setState("editing"); }
  function reset() { setEditingId(null); setDraft(emptyDraft()); setFailure(""); setState("idle"); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("saving"); setFailure("");
    const payload: ActionTakenPayload = { actionDateTime: new Date(draft.actionDateTime).toISOString(), description: draft.description, result: draft.result, followUpRequired: draft.followUpRequired, followUpNote: draft.followUpNote, attachmentNotes: draft.attachmentNotes };
    try {
      const saved = editingId === null ? await createStaffAction(ticketId, payload) : await updateStaffAction(ticketId, editingId, { ...payload, updatedAt: actions.find((action) => action.id === editingId)?.updatedAt });
      setActions((current) => editingId === null ? [...current, saved].sort((a, b) => a.actionDateTime.localeCompare(b.actionDateTime)) : current.map((action) => action.id === saved.id ? saved : action));
      reset();
    } catch (error) { setFailure(error instanceof Error ? error.message : "The Action Taken could not be saved."); setState("editing"); }
  }

  return <section className="form-section actions-panel" aria-labelledby="actions-taken-heading"><div className="section-heading"><div><h2 id="actions-taken-heading">Actions Taken</h2><p>Operational work is recorded under this Ticket with the authenticated staff account.</p></div>{!readOnly && state === "idle" && <button className="button button--primary" type="button" onClick={() => setState("editing")}>Add Action Taken</button>}</div>
    {failure && <div className="state-panel state-panel--error" role="alert">{failure}</div>}
    {actions.length === 0 && state === "idle" && <p className="state-panel" role="status">No Actions Taken have been recorded for this Ticket.</p>}
    {actions.length > 0 && <ol className="action-list">{actions.map((action) => <li key={action.id} className="action-card"><div className="action-card__header"><div><strong>{formatDate(action.actionDateTime)}</strong><span>Performed by {action.performedBy.name}</span></div>{!readOnly && <button className="button button--tertiary" type="button" onClick={() => edit(action)}>Edit</button>}</div><dl className="action-details"><div><dt>Action Description</dt><dd>{action.description}</dd></div><div><dt>Result</dt><dd>{action.result}</dd></div><div><dt>Follow-Up Required?</dt><dd>{action.followUpRequired ? "Yes" : "No"}</dd></div>{action.followUpNote && <div><dt>Follow-Up Note</dt><dd>{action.followUpNote}</dd></div>}{action.attachmentNotes && <div><dt>Attachment Notes</dt><dd>{action.attachmentNotes}</dd></div>}</dl></li>)}</ol>}
    {!readOnly && state !== "idle" && <form className="action-editor" onSubmit={submit} aria-label={editingId === null ? "Create Action Taken" : "Edit Action Taken"}><h3>{editingId === null ? "Add Action Taken" : "Edit Action Taken"}</h3><div className="form-grid form-grid--two"><div className="field-group"><label htmlFor="action-date-time">Action Date/Time <span aria-hidden="true">*</span></label><input id="action-date-time" type="datetime-local" value={draft.actionDateTime} onChange={(event) => setDraft({ ...draft, actionDateTime: event.target.value })} required /></div><div className="field-group"><label htmlFor="action-performed-by">Performed by</label><input id="action-performed-by" value="Authenticated IT Staff / Administrator" readOnly /></div></div><div className="field-group"><label htmlFor="action-description">Action Description <span aria-hidden="true">*</span></label><textarea id="action-description" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} maxLength={5000} required /></div><div className="field-group"><label htmlFor="action-result">Result <span aria-hidden="true">*</span></label><textarea id="action-result" rows={3} value={draft.result} onChange={(event) => setDraft({ ...draft, result: event.target.value })} maxLength={5000} required /></div><label className="checkbox-label"><input type="checkbox" checked={draft.followUpRequired} onChange={(event) => setDraft({ ...draft, followUpRequired: event.target.checked })} /> Follow-Up Required?</label>{draft.followUpRequired && <div className="field-group"><label htmlFor="action-follow-up-note">Follow-Up Note <span aria-hidden="true">*</span></label><textarea id="action-follow-up-note" rows={2} value={draft.followUpNote} onChange={(event) => setDraft({ ...draft, followUpNote: event.target.value })} maxLength={5000} required /></div>}<div className="field-group"><label htmlFor="action-attachment-notes">Attachment Notes</label><textarea id="action-attachment-notes" rows={2} value={draft.attachmentNotes} onChange={(event) => setDraft({ ...draft, attachmentNotes: event.target.value })} maxLength={2000} /></div><div className="form-actions"><button className="button button--primary" type="submit" disabled={state === "saving"}>{state === "saving" ? "Saving…" : editingId === null ? "Save Action Taken" : "Save Changes"}</button><button className="button button--tertiary" type="button" disabled={state === "saving"} onClick={reset}>Cancel</button></div></form>}
  </section>;
}
