# Lab 4 Visual, Responsive and Accessibility Checklist

## Evidence identity and checklist meaning

Latest executed staging run: **5ab13bbf53371b1e42bacbfe22c00296b9f68d0c**, 2026-10-14. [Phase JSON/logs and six BROWSER-SCAN results](https://github.com/PhraewaS/toktickit/pull/63#issuecomment-6168420145). The documentation maintenance inspected the 12 unmodified screenshots in [documentation-review](../../artifacts/lab-04/evidence/documentation-review/summary.md), plus the actual CSS/components/tests. It does not claim a new browser run on this documentation branch or a final-main pass.

Checked means the stated evidence/method was inspected or executed; it does **not** mean all UI states or complete WCAG conformance. Unchecked final gates are intentionally retained until actual verification. Viewports: desktop 1440x1000, tablet 834x1112, mobile 390x844, Chromium. Editor screenshots capture the entire form element; other images show a viewport, not an entire page.

| Check | Evidence / method | Observed result and scope | Pre-release |
| --- | --- | --- | --- |
| Zen Green consistency | CSS tokens + 12 screenshots | Shared green shell/cards/buttons/spacing; no inconsistent theme observed in captured areas | [x] |
| Dashboard labels/counts/drill-down | Dashboard captures + API/component/E2E metric evidence | Labels/values visible; selected DB/API/UI values match; matching filter callbacks/requests tested | [x] |
| Actions fields / follow-up | Three complete editor captures + UI-04 | Date/time, description, result, readonly actor, checkbox, note, attachment notes and Save/Discard shown; follow-up note revealed | [x] |
| Editable / read-only and role boundary | Editor/list source + UI-04 and API-04 | Actor readonly, Requester Add/Edit absent; existing Ticket attachment permission is independent of Action readonly state | [x] |
| Validation placement | ActionsTaken field-error/aria linkage source + named UI-04 server-validation case | Message maps to Follow-Up Note and aria-invalid; **source/component check**, not a screenshot of every error | [x] |
| Loading/empty/forbidden/safe failure | Dashboard and Actions component cases + visible Requester empty recent list | Distinct behavior checked; no claim that all feedback states were photographed at all widths | [x] |
| Keyboard focus and activation | RESP-04 Tab/Enter/Space and focus-visible assertions | Both dashboards and Add/follow-up/note/Save reached; visible focus also shown on editor Save | [x] |
| Horizontal overflow / control fit | RESP-04 document scrollWidth and all-control bounding rectangles | All six flows pass at three widths; this checks horizontal fit, not every possible vertical overlap | [x] |
| Clipping / overlap in captured areas | Manual inspection of 12 images | No overlapping control boxes or clipped labels observed in captured areas; below-fold page content not covered by viewport captures | [x] |
| Non-color status / semantic labels | Source and captures | Text status/priority badges and labelled fields complement color; no color-only meaning observed | [x] |
| Browser console / safe HTTP failures | Six BROWSER-SCAN checks | No unexpected console/page/HTTP errors; initial unauthenticated auth/me 401 probes explicitly allowed | [x] |
| Secret hygiene | Captures and report redaction checks | Seeded names/test accounts only; no password/token/connection URL in supplied captures; sanitized reports preserve outcomes | [x] |

### Remaining final-main / submission checks

- [ ] Rerun six verification phases and RESP-04 on the actual released main product SHA; capture each required major Lab 4 surface at all three widths.
- [ ] Inspect scrolled/full-page Dashboard and read-only Action list content, create **and edit** modes, plus validation/forbidden/conflict/failure states for vertical clipping/overlap and readable feedback. Current viewport images and automated horizontal fit do not claim this complete audit.
- [ ] Reconfirm existing Lab 3 major-screen visual/navigation/role/private-content consistency using the final regression evidence.
- [ ] Complete final visual checklist and ensure PDF images/links are readable; distinguish tested product SHA from evidence-only commits.
- [ ] Obtain peer review/approval of final evidence before Issue #54/Done. No full WCAG/axe certification or measured contrast audit is asserted.

## RESP-04 recorded keyboard and focus sequences

## Recorded browser verification

The checks below ran in Chromium at desktop (1440x1000), tablet (834x1112), and mobile (390x844) viewports. Each viewport test used actual Tab, Enter, or Space keyboard input. Focus assertions checked both `document.activeElement` and the browser's `:focus-visible` state. The run also checked horizontal overflow and that interactive controls stayed within the viewport.

| Surface | Keyboard sequence | Expected and observed result |
| --- | --- | --- |
| Requester Dashboard | Tab to **View My Tickets**; Enter | Control receives visible keyboard focus; opens My Tickets with Current Status `ACTIVE`. |
| Staff Dashboard | Tab to **Open Queue**; Enter | Control receives visible keyboard focus; opens Ticket Queue with Owner `unassigned` and Activity `true`. |
| Actions Taken editor | Tab to **Add Action Taken**; Enter | Control receives visible keyboard focus; opens the Create Action Taken form. |
| Actions Taken editor | Tab to **Follow-Up Required?**; Space | Checkbox receives visible keyboard focus; Follow-Up Note field is revealed. |
| Actions Taken editor | Tab to **Follow-Up Note**; enter draft text | Field receives visible keyboard focus and accepts input. |
| Actions Taken editor | Tab to **Save Action Taken** | Save control receives visible keyboard focus. The test deliberately does not submit the draft. |

All six responsive browser checks passed (two flows at each of three viewports). The focused `staff-actions-editor-{desktop,tablet,mobile}.png` captures show the complete open form, including required fields, Follow-Up Note, Save Action Taken, and Discard draft. Screenshot capture is of the form itself so the complete editor remains legible at mobile width; the viewport-fit assertion runs before capture.

This is targeted keyboard operability evidence for the requested dashboard and Actions Taken paths. It is not represented as a complete WCAG audit or an automated axe scan.

## Integration repeat

Issue #54 reruns these same checks on its recorded integration source revision. Current screenshots are under `artifacts/lab-04/screenshots/staff-dashboard/`, `requester-dashboard/` and `actions-taken/`; the editor files are in `actions-taken/`. See the separate staging-integration summary/logs for the exact run rather than attributing the regenerated captures to the historical #53 revision. Final-main verification remains pending release approval and merge.
