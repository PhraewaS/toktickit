# Final-main visual gallery

Product e1fa72f, Chromium at three widths. Each image is unchanged actual browser output; see results.json for state source and horizontal-fit assertions. Live seeded API success and actual 400 validation are separate from explicitly controlled HTTP visual fixtures. Full pages include below-fold content; panel/editor images show entire elements. No WCAG/axe/contrast certification is claimed.

| Surface / state | Desktop | Tablet | Mobile | Source |
| --- | --- | --- | --- | --- |
| requester-dashboard-full | [desktop](desktop-requester-dashboard-full.png) | [tablet](tablet-requester-dashboard-full.png) | [mobile](mobile-requester-dashboard-full.png) | live seeded API |
| requester-dashboard-metrics | [desktop](desktop-requester-dashboard-metrics.png) | [tablet](tablet-requester-dashboard-metrics.png) | [mobile](mobile-requester-dashboard-metrics.png) | live seeded API |
| requester-dashboard-lists | [desktop](desktop-requester-dashboard-lists.png) | [tablet](tablet-requester-dashboard-lists.png) | [mobile](mobile-requester-dashboard-lists.png) | live seeded API |
| requester-dashboard-empty | [desktop](desktop-requester-dashboard-empty.png) | [tablet](tablet-requester-dashboard-empty.png) | [mobile](mobile-requester-dashboard-empty.png) | controlled HTTP empty visual fixture; backend correctness covered by the unchanged full suites |
| requester-dashboard-forbidden | [desktop](desktop-requester-dashboard-forbidden.png) | [tablet](tablet-requester-dashboard-forbidden.png) | [mobile](mobile-requester-dashboard-forbidden.png) | controlled HTTP forbidden visual fixture; backend correctness covered by the unchanged full suites |
| requester-dashboard-failure | [desktop](desktop-requester-dashboard-failure.png) | [tablet](tablet-requester-dashboard-failure.png) | [mobile](mobile-requester-dashboard-failure.png) | controlled HTTP failure visual fixture; backend correctness covered by the unchanged full suites |
| requester-dashboard-loading | [desktop](desktop-requester-dashboard-loading.png) | [tablet](tablet-requester-dashboard-loading.png) | [mobile](mobile-requester-dashboard-loading.png) | controlled HTTP loading visual fixture; backend correctness covered by the unchanged full suites |
| requester-actions-full | [desktop](desktop-requester-actions-full.png) | [tablet](tablet-requester-actions-full.png) | [mobile](mobile-requester-actions-full.png) | live seeded API |
| requester-actions-panel | [desktop](desktop-requester-actions-panel.png) | [tablet](tablet-requester-actions-panel.png) | [mobile](mobile-requester-actions-panel.png) | live seeded API |
| staff-dashboard-full | [desktop](desktop-staff-dashboard-full.png) | [tablet](tablet-staff-dashboard-full.png) | [mobile](mobile-staff-dashboard-full.png) | live seeded API |
| staff-dashboard-metrics | [desktop](desktop-staff-dashboard-metrics.png) | [tablet](tablet-staff-dashboard-metrics.png) | [mobile](mobile-staff-dashboard-metrics.png) | live seeded API |
| staff-dashboard-lists | [desktop](desktop-staff-dashboard-lists.png) | [tablet](tablet-staff-dashboard-lists.png) | [mobile](mobile-staff-dashboard-lists.png) | live seeded API |
| staff-dashboard-empty | [desktop](desktop-staff-dashboard-empty.png) | [tablet](tablet-staff-dashboard-empty.png) | [mobile](mobile-staff-dashboard-empty.png) | controlled HTTP empty visual fixture; backend correctness covered by the unchanged full suites |
| staff-dashboard-forbidden | [desktop](desktop-staff-dashboard-forbidden.png) | [tablet](tablet-staff-dashboard-forbidden.png) | [mobile](mobile-staff-dashboard-forbidden.png) | controlled HTTP forbidden visual fixture; backend correctness covered by the unchanged full suites |
| staff-dashboard-failure | [desktop](desktop-staff-dashboard-failure.png) | [tablet](tablet-staff-dashboard-failure.png) | [mobile](mobile-staff-dashboard-failure.png) | controlled HTTP failure visual fixture; backend correctness covered by the unchanged full suites |
| staff-dashboard-loading | [desktop](desktop-staff-dashboard-loading.png) | [tablet](tablet-staff-dashboard-loading.png) | [mobile](mobile-staff-dashboard-loading.png) | controlled HTTP loading visual fixture; backend correctness covered by the unchanged full suites |
| staff-actions-full | [desktop](desktop-staff-actions-full.png) | [tablet](tablet-staff-actions-full.png) | [mobile](mobile-staff-actions-full.png) | live seeded API |
| staff-actions-panel | [desktop](desktop-staff-actions-panel.png) | [tablet](tablet-staff-actions-panel.png) | [mobile](mobile-staff-actions-panel.png) | live seeded API |
| actions-create-follow-up | [desktop](desktop-actions-create-follow-up.png) | [tablet](tablet-actions-create-follow-up.png) | [mobile](mobile-actions-create-follow-up.png) | live editor, unsubmitted draft |
| actions-validation | [desktop](desktop-actions-validation.png) | [tablet](tablet-actions-validation.png) | [mobile](mobile-actions-validation.png) | live server 400 for whitespace description; no invalid Action saved |
| actions-edit-follow-up | [desktop](desktop-actions-edit-follow-up.png) | [tablet](tablet-actions-edit-follow-up.png) | [mobile](mobile-actions-edit-follow-up.png) | live loaded Action, unsubmitted edit |
| actions-conflict | [desktop](desktop-actions-conflict.png) | [tablet](tablet-actions-conflict.png) | [mobile](mobile-actions-conflict.png) | controlled HTTP 409; actual version/retry behavior verified by API/component suites |
| actions-refresh-failure-draft | [desktop](desktop-actions-refresh-failure-draft.png) | [tablet](tablet-actions-refresh-failure-draft.png) | [mobile](mobile-actions-refresh-failure-draft.png) | controlled HTTP 500; draft retained and retry visible |
| actions-forbidden | [desktop](desktop-actions-forbidden.png) | [tablet](tablet-actions-forbidden.png) | [mobile](mobile-actions-forbidden.png) | controlled HTTP 403; editor/protected list hidden |
