# First-Login Onboarding

**Status:** Working draft; design this flow one step at a time.

## Purpose

Help a new account owner reach a useful first workspace quickly, using the information they provide to tailor SalesMora's CRM, agent, and lead-capture setup. Avoid asking for configuration that can be deferred until it is needed.

This document covers the experience after account creation. Account registration and authentication are described in the [interactive prototype plan](interactive-prototype-plan.md); this flow begins when the new user signs in for the first time.

## Product principles to carry into onboarding

- **Simple first, agent-led:** Ask for the intended outcome in plain language and let the agent prepare a useful setup.
- **Reuse context:** Capture business profile, services, service area, team, and workflow context once so later agent actions can use it.
- **Progressive detail:** Gather essentials first; defer advanced pipeline, automation, and integration choices until the user needs them.
- **Visible and controllable:** Show what the agent proposes, let the owner correct it, and require explicit approval before creating records, sending invitations, connecting services, publishing, or activating automation.
- **Reach value early:** Make it clear how to get into the workspace and continue setup later if the user does not have every answer.

## Entry conditions and audience

The first-login path should distinguish between:

- **Account owner creating a new business workspace:** likely needs the initial business profile and a starter workspace.
- **Invited teammate joining an existing workspace:** should accept the invitation and see role-appropriate context, without repeating owner setup.

After invitation acceptance, send the teammate directly to the existing workspace's role-aware Home screen. Do not send invitees through account-owner registration or organization setup; enforce the assigned role and record access.

## Existing prototype baseline

After registration, [Screen 02 — Organization setup](../prototype/prototype-screen-02.html) already guides a new owner through:

1. Business name and business type/trade (both required).
2. Services (at least one required), plus an optional primary ZIP/postal code and typical service range. The range choices include multiple regions, with a note that more detailed coverage rules can be added later.
3. Optional teammate invitations, with a clear skip option and the new workspace Owner stated. Permission role defaults to Member; the Owner can explicitly choose Admin. Work profile is a separate optional Office/Field choice, defaulting to Office. Queue invitations during setup and send them only after workspace creation and email verification.
4. A review step before creating the sample workspace.

Screen 02 is the onboarding screen after registration and is considered a solid starting experience. Keep its current flow intact for now: do not add a separate welcome page or change its setup steps. Keep the fixed service choices; defer agent-suggested services until customer feedback supports revisiting them. This document records the existing journey and can capture future improvements separately.

## Proposed first-login sequence

The Screen 02 baseline below is accepted for now. New owners may complete setup and enter their workspace before verifying their email. Require email verification before sending teammate invitations or connecting Gmail. After setup and workspace creation, send the owner to the role-aware Home screen. Home's prominent assistant suggests a useful next action based on the new workspace, such as creating a first lead or setting up a lead-capture campaign; do not add lead-source setup to Screen 02 or create a separate onboarding checklist. The sequence also notes follow-on questions and future enhancements; those remain open until discussed.

| Step | User need | Possible experience | Decision status |
|---|---|---|---|
| 1. Business profile | Give SalesMora enough context to personalize the workspace. | Screen 02 requires business name and business type/trade. An optional website field was proposed for later consideration, but is not part of the current screen. | Existing; keep as-is for now |
| 2. Services and service area | Define what work the company takes and where it operates. | Screen 02 offers fixed service choices and optional primary ZIP/postal code plus a typical service range. Keep these choices for now; agent suggestions are deferred pending customer feedback. | Decided |
| 3. Team and role | Set up access and ownership expectations. | The creator is the Owner. Optional teammate invitations default to the Member permission role and Office work profile; the Owner can explicitly select Admin and optionally choose Field as the work profile. Send queued invitations only after workspace creation. | Decided |
| 4. Review and create workspace | Understand what will be configured before entering the product. | Screen 02 summarizes entered details for review, then creates the sample workspace. | Existing; keep as-is for now |
| 5. First useful action | Give the user a concrete next step in the product. | After setup, continue to role-aware Home, where the prominent assistant suggests creating a first lead or setting up a lead-capture campaign. Do not add lead-source setup to Screen 02 or a separate onboarding checklist. | Decided |

## Deferred onboarding enhancements

- Revisit agent-suggested services only if customer feedback shows a need; Screen 02 continues using fixed choices.
- Keep lead-source setup after onboarding, with Home's assistant suggesting campaign setup when appropriate.

## Decisions log

Record decisions here as we review the flow, including the date and any remaining assumptions. Keep unresolved questions visible rather than turning prototype behavior into an implied product requirement.

| Date | Decision | Notes |
|---|---|---|
| 2026-10-07 | Created the onboarding outline for collaborative, step-by-step design. | Existing Screen 02 is the accepted onboarding baseline; future enhancements remain open. |
| 2026-10-07 | Keep Screen 02 as the onboarding screen after registration. | It is a solid existing flow. Do not add a separate welcome page or change Screen 02 for now. |
| 2026-10-09 | Use Owner, Admin, and Member as workspace permission roles; treat Office and Field as separate work profiles. | The account creator starts as Owner. Work profiles may tailor home content but do not grant permissions. |
| 2026-10-09 | Default teammate invitations to Member; allow an Owner/Admin to choose Admin explicitly. | A regular invitation does not grant workspace administration. |
| 2026-10-09 | Treat invitee work profile as separate from permission role; default it to Office and allow an optional Field choice. | Work profiles affect Home priorities, not permissions. |
| 2026-10-09 | Allow owners to enter the workspace before email verification; require verification before sending invitations or connecting Gmail. | Queue invitations until both workspace creation and verification are complete. |
| 2026-10-09 | Require explicit confirmation before the agent creates records, sends invitations, connects services, publishes, or activates automation. | The agent may prepare editable suggestions; consequential changes wait for user approval. |

## Related documentation

- [User journeys](user-journeys.md) — product principles and account/lead-source journeys.
- [Interactive prototype plan](interactive-prototype-plan.md) — registration, organization setup, and first-use screens.
- [Product and delivery roadmap](salesmora-product-roadmap.md) — planned product architecture and delivery phases.
