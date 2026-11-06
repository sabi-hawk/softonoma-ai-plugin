# CU task-description templates (New Feature Request / Change Request)

Source: "Ticket Handoff Playbook" — the pre-read for the "AI Development
Automation - Claude Team Orchestration" workshop (2026-09-08). Treat as
provisional until that session locks the final template/DoR; update this
file as the single source of truth if the locked version differs.

Every section traces to a real source — nothing invented to fill a gap. An
unavailable fact is flagged under Open Questions, never guessed. Use the
section headings exactly as written so the engineering agent (and the next
BA) can find the same information in the same place every time.

## Before you mark it APPROVED

- Every heading in the template below is filled in — no placeholder left behind.
- Sources Used lists exactly what this is based on — nothing in the ticket goes beyond it.
- UI change? A Figma/visual reference is in Requirements → Visual, not just described in prose.
- Acceptance criteria are things someone can literally check off, not vibes.
- Open Questions and Blockers are listed explicitly, or the section says "None" — never left out entirely.
- No real customer or staff data anywhere in the ticket — synthetic data only.

## New Feature Request

```markdown
## Sources Used
- *exactly what this draft is based on — BR link/doc, ClickUp task, meeting notes, project-knowledge files. Nothing below may go beyond what's listed here.*

## Scope Classification
*FR-only (single team/system, fits one release cycle, no cross-system dependency) — or BR-required-first (spans systems/teams/processes). State which, and why.*

## Context
*plain-English background — what exists today, what problem was observed, with concrete numbers and/or direct quotes from user research or stakeholder feedback where available. No invented numbers, no invented quotes.*

## Goals
- *outcome this FR is meant to achieve — stated as an outcome, not an implementation*

## Non-Goals
- *explicitly out of scope for this feature entirely, e.g. "No new dependencies", "No backend/API changes" — every non-goal comes from the user, never guessed*

## Linkage
- BR this traces to: *link, or "N/A — FR-only, see Scope Classification"*
- Sibling FRs (depends on / depended on by): *links, or "None"*

## Requirements
### Functional
- *MUST / MUST NOT / SHOULD statement — exact values where applicable, never "appropriately" or "responsive"*
### Visual
- *exact spacing/breakpoint/pixel values; Figma link/frame goes here — required whenever this FR has any UI*
### Accessibility
- *…*
### API / Integration
- *… — triggers the mapping table below if this references an integration*
### Data / Batch
- *…*
### Reporting
- *…*
*(mark any discipline "N/A" explicitly — never omit it silently)*

## User Stories
*only if this FR is story-driven — otherwise write "N/A — uses the numbered Requirements above."*

### US-XX.Y — short title
**Story:** *As a [role], I need/want [capability], so that [business outcome].*
**Acceptance Criteria:**
1. *precise, testable statement — exact values, field names, statuses, formats*
- Field Visibility & Placement: *…*
- Mandatory Enforcement & Real-time Validation: *…*
- Tooltip/Footnote & UI Behavior: *…*
- User Role Permissions: *…*
- Editing & Locking Rules: *…*
- API Validation Rules: *…*
- Persistence & Sync Rules: *…*
- Database Consistency Rules: *…*
- Mirroring Across Modules: *…*
- Legacy Lead/Record Handling: *…*
- Downstream System Behavior: *…*
- Audit Logging Requirements: *…*
*(mark any category "N/A" explicitly — never omit it)*

## Acceptance Criteria
*always populated, even where Requirements above already contains MUST-statements*

## Design Notes for Engineering
**For [FR-ID]:**
- *exact file paths, component/function/prop/field names to reuse, the existing pattern to match, library/rendering approach, precise location in the codebase. "Not yet provided — flagged for user input" if none available.*

## Rollout
- Branch/deploy workflow: *…*
- PR title convention: *…*
- Named reviewer to tag: *…*
- Rollback plan: *…*
- Infra impact (env vars, migrations, config changes): *state exactly, or "None"*

## Out of Scope for This Ticket (Parked for Later)
- *deferred future work the user has explicitly acknowledged*

## Blockers
- ⚠️ *external dependency that must land before implementation/verification — cross-referenced to the requirement/AC it blocks*

## Impact & Gap Analysis
- Integrations impacted? *…*
- Other apps or products impacted? *…*
- Reports, workflows, roles, or email templates affected? *…*
- New ventures (HolidayMarket.ae, CreditMarket.ae, InvestmentMarket.ae) or new markets (GCC) impacted? *…*
- Relevant stakeholders (HR, Finance, Ops, Compliance) consulted? *…*
- Customer communications reviewed (OCB emails, follow-ups, WhatsApp)? *…*
- Translation required (Arabic / Russian / Chinese)? *…*
- Copy Review needed? *…*
- SEO Review needed? *…*
- Events Tracking (GA4, Mixpanel) needed? *…*
- Security Team Review triggered (auth, PII, payment data)? *…*
- Data Team Review triggered (new/changed capture, storage, or reporting)? *…*
- Stakeholder sign-off chain (SA Review → Stakeholders → Security → Data → Product): *…*
*(any unanswered item goes under Open Questions below — never silently marked N/A)*

## Open Questions
- *listed and resolved, or explicitly flagged as outstanding — never omitted*
```

## Change Request

Identical structure to the FR above — a change is just an FR whose Context
describes existing behaviour instead of a blank slate. The two differences:
Context splits explicitly into Current Behaviour and Requested Change, and
Impact & Gap Analysis opens by asking directly whether what's changing is
reused elsewhere.

```markdown
## Sources Used
- *exactly what this draft is based on — BR link/doc, ClickUp task, meeting notes, project-knowledge files. Nothing below may go beyond what's listed here.*

## Scope Classification
*FR-only (single team/system, fits one release cycle, no cross-system dependency) — or BR-required-first (spans systems/teams/processes). State which, and why.*

## Context
**Current Behaviour:** *what the system does today, plainly stated — the starting point, not assumed*
**Requested Change:** *what should happen instead, and why — the business reason for the change*

## Goals
- *outcome this change is meant to achieve — stated as an outcome, not an implementation*

## Non-Goals
- *explicitly out of scope for this change entirely — every non-goal comes from the user, never guessed*

## Linkage
- BR/FR this traces to: *link, or "N/A"*
- Sibling tickets (depends on / depended on by): *links, or "None"*

## Requirements
### Functional
- *MUST / MUST NOT / SHOULD statement — exact values where applicable, never "appropriately" or "responsive"*
### Visual
- *exact spacing/breakpoint/pixel values; Figma link/frame goes here — required whenever the UI changes*
### Accessibility
- *…*
### API / Integration
- *… — triggers the mapping table below if this references an integration*
### Data / Batch
- *…*
### Reporting
- *…*
*(mark any discipline "N/A" explicitly — never omit it silently)*

## User Stories
*only if this change is story-driven — otherwise write "N/A — uses the numbered Requirements above."*

### US-XX.Y — short title
**Story:** *As a [role], I need/want [capability], so that [business outcome].*
**Acceptance Criteria:**
1. *precise, testable statement — exact values, field names, statuses, formats*
- Field Visibility & Placement: *…*
- Mandatory Enforcement & Real-time Validation: *…*
- Tooltip/Footnote & UI Behavior: *…*
- User Role Permissions: *…*
- Editing & Locking Rules: *…*
- API Validation Rules: *…*
- Persistence & Sync Rules: *…*
- Database Consistency Rules: *…*
- Mirroring Across Modules: *…*
- Legacy Lead/Record Handling: *…*
- Downstream System Behavior: *…*
- Audit Logging Requirements: *…*
*(mark any category "N/A" explicitly — never omit it)*

## Acceptance Criteria
*always populated, even where Requirements above already contains MUST-statements*

## Design Notes for Engineering
**For [ticket ID]:**
- *exact file paths, component/function/prop/field names to reuse, the existing pattern to match, library/rendering approach, precise location in the codebase. "Not yet provided — flagged for user input" if none available.*

## Rollout
- Branch/deploy workflow: *…*
- PR title convention: *…*
- Named reviewer to tag: *…*
- Rollback plan: *…*
- Infra impact (env vars, migrations, config changes): *state exactly, or "None"*

## Out of Scope for This Ticket (Parked for Later)
- *deferred future work the user has explicitly acknowledged*

## Blockers
- ⚠️ *external dependency that must land before implementation/verification — cross-referenced to the requirement/AC it blocks*

## Impact & Gap Analysis
- Is what's changing reused anywhere else? *…*
- What does reverting or re-enabling this later require? *…*
- Integrations impacted? *…*
- Other apps or products impacted? *…*
- Reports, workflows, roles, or email templates affected? *…*
- New ventures (HolidayMarket.ae, CreditMarket.ae, InvestmentMarket.ae) or new markets (GCC) impacted? *…*
- Relevant stakeholders (HR, Finance, Ops, Compliance) consulted? *…*
- Customer communications reviewed (OCB emails, follow-ups, WhatsApp)? *…*
- Translation required (Arabic / Russian / Chinese)? *…*
- Copy Review needed? *…*
- SEO Review needed? *…*
- Events Tracking (GA4, Mixpanel) needed? *…*
- Security Team Review triggered (auth, PII, payment data)? *…*
- Data Team Review triggered (new/changed capture, storage, or reporting)? *…*
- Stakeholder sign-off chain (SA Review → Stakeholders → Security → Data → Product): *…*
*(any unanswered item goes under Open Questions below — never silently marked N/A)*

## Open Questions
- *listed and resolved, or explicitly flagged as outstanding — never omitted*
```
