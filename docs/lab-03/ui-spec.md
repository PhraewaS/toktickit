# TokTickIT Lab 3 UI Specification

The Lab 3 client extends the Lab 2 Zen Green tokens, field groups, cards, badges, state panels, focus treatment, and responsive rules. The shell header shows TokTickIT, the authenticated user's name and role badge, role-specific navigation, and Logout. There is no Development Requester selector or Change requester action in the production client.

## Screens and modes

| Screen | Modes | Main controls and feedback |
|---|---|---|
| Login | view, submitting, validation, failure | Email/password, safe error, inactive-safe error, busy state |
| Change Password | mandatory form, submitting, success/failure | New/confirm password, password rules, success continuation |
| Create Ticket | create, loading, validation, success/failure | Existing Lab 2 fields and attachments, authenticated requester read-only |
| My Tickets | loading, populated, empty, no-results, failure | Existing search/filter/sort/pagination and owned-only results |
| Requester Ticket Detail | loading, view, comment, resolved, failure | Read-only ticket data, attachments, Public Comments, resolved indication |
| Staff Ticket Queue | loading, populated, empty/no-results, forbidden/failure | Search, status/priority/owner filters, sortable table, page controls, open detail |
| Staff Ticket Detail | view/edit operations, saving, success/validation/conflict/failure | Owner, IT Priority, status, public comment composer, visually distinct yellow Internal Note composer, attachments |
| User Management | loading, list, create, edit, reset-password, validation/forbidden/failure | Name/email/role/status list, search, optional role filter, small modal/form |

## Responsive and accessibility rules

Desktop uses a readable queue table with Ticket Number, Summary, Category, Requested Priority, IT Priority, Status, Owner, and Last Updated. Tablet keeps the table within a scroll-safe card; mobile switches each row to a labeled stacked card and keeps actions reachable. User and ticket forms collapse to one column below 760px. No page-level horizontal overflow is allowed. Every input has a label, errors are adjacent and connected through `aria-describedby`, focus is visible, status is not communicated by color alone, and loading/saving states use `aria-live` or `role=alert/status`.

Internal Notes use a clearly labeled tinted panel and a “private to IT Staff and Administrators” warning directly above the composer and list. Public Comments use a separate neutral panel. Editable controls are visibly distinct from read-only fields. Destructive deactivation uses confirmation and conflict messages.

## Visual checklist

- [ ] Green brand tokens and button/badge conventions match Lab 2.
- [ ] Authenticated name/role and only permitted navigation are visible.
- [ ] Status, requested priority, IT priority, and role badges have text labels.
- [ ] Validation, forbidden, empty/no-results, saving, and failure feedback is readable.
- [ ] Read-only versus editable fields are visually obvious.
- [ ] Desktop/tablet/mobile screenshots show no clipping, overlap, unreadable text, or horizontal overflow.
- [ ] Keyboard focus, labels, table/card semantics, and non-color-only state cues pass accessibility review.
