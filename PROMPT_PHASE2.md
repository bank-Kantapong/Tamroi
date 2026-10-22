# Prompt for AI Coding Agent — Build TAMROI Phase 2

You are the senior full-stack engineer continuing the existing TAMROI (ตามรอย) project.

## First: inspect the existing project

Read `AGENTS.md`, `README.md`, `docs/PHASE_STATUS.md` (or `PHASE_STATUS.md` if that is where it lives), and the current source code before making changes.

**Do not assume Phase 1 is complete.** Audit the current implementation and run available checks. If critical Phase 1 acceptance criteria are still failing, report them first and fix only the blockers that prevent Phase 2 from being built safely. Do not rewrite working Phase 1 features just to match your preferred architecture.

If the project owner has not approved starting Phase 2, stop and ask for approval. If this prompt is the owner's explicit approval, proceed.

## Goal

Implement Phase 2: authenticated accounts, saved trips synchronized across devices, creator profiles, and a moderated trip-submission workflow—while preserving all working Phase 1 functionality and the strict free-first requirement.

Phase 2 must be a usable extension of the existing app, not a disconnected prototype.

## Mandatory scope

### 1. User authentication
- Add sign-up, sign-in, sign-out, and session persistence using the authentication provider already present in the project, if suitable.
- If Phase 1 has no auth provider, choose the simplest secure provider with a usable free tier (e.g. Supabase Auth) only after inspecting the current architecture and documenting the free-tier limitations.
- Validate inputs and show helpful loading, success, and error states.
- Add password reset only if supported by the chosen provider without introducing paid requirements; document email delivery limits and configuration.
- Do not require login to browse published trips or open Google Maps navigation.
- Do not implement social login unless already configured and free to operate.
- Never store plaintext passwords or expose secret/service-role keys to client-side code.
- Provide a safe, documented way to provision the first admin. Never hardcode credentials in source control.

### 2. User profile
- Add a minimal profile page with display name and optional avatar URL.
- Keep profile fields minimal; do not request unnecessary personal data.
- Users may edit only their own profile unless they are an authorized admin.
- Validate display name and image URL and handle missing avatars gracefully.
- Do not build public followers, messaging, or social feeds.

### 3. Saved trips
- Add a save/unsave action to published trip cards and trip detail pages for signed-in users.
- Persist saved trips in the database so they synchronize across devices.
- Add a “Saved Trips” page for the current user.
- Prevent duplicate saved records with a database uniqueness constraint on `(user_id, trip_id)`.
- Ensure users can only read, add, and remove their own saved-trip records.
- For logged-out visitors, either prompt them to sign in or optionally provide a clearly labeled local-only save experience if it fits the current design. Do not imply local-only saves synchronize.
- If a saved trip is unpublished or deleted, handle it safely without exposing unpublished content.

### 4. Community trip submission with moderation
- Signed-in users can create a trip submission and edit their own submission while it is pending or rejected.
- Submissions must enter a `pending_review` state and must not appear in public trip listings, search, maps, or public slug routes before approval.
- Admins can review submissions and approve/publish, reject with a reason, or return them for edits if the existing design supports it.
- After approval, the trip should use the existing Phase 1 public trip page, map, stop list, and Google Maps behavior.
- Clearly distinguish a creator's own draft/pending/rejected trips in their dashboard.
- Prevent a regular user from setting their own trip to `published`, changing moderation status, or assigning themselves admin privileges.
- Validate trip fields and every stop server-side, including coordinates, required fields, maximum reasonable text/image lengths, and stop ordering.
- Add basic abuse protections appropriate to the current architecture, such as rate limiting if a reliable free implementation is available, input size limits, and moderation status checks. Do not add a paid service.
- Do not add reviews, comments, ratings, likes, followers, public reports, or recommendation engines in Phase 2; those belong to later work.

### 5. Admin moderation
- Extend the existing protected admin area rather than creating a second one.
- Add a queue for pending community submissions with submitted date, creator, trip title, stop count, and moderation status.
- Admins can inspect all trip and stop details before approval.
- Admins can approve/publish or reject a submission and provide a clear rejection reason.
- Record basic moderation timestamps and reviewer identity where practical.
- Keep the existing Phase 1 admin trip CRUD working.

## Data and access-control requirements

Inspect the actual schema first and create additive migrations. Preserve existing data and avoid destructive resets.

Use equivalent structures if the current stack differs, but maintain these concepts:

### profiles
- user_id (references the auth identity; unique)
- display_name
- avatar_url (nullable)
- role or equivalent trusted role mapping, with secure admin assignment
- created_at
- updated_at

### saved_trips
- user_id
- trip_id
- created_at
- unique constraint on `(user_id, trip_id)`

### trip moderation fields
Add or adapt fields on the existing `trips` table, such as:
- created_by
- status: `draft`, `pending_review`, `published`, `rejected`
- rejection_reason (nullable)
- submitted_at (nullable)
- reviewed_at (nullable)
- reviewed_by (nullable)
- created_at
- updated_at

Do not duplicate an existing field or create a second trip table if the project already has an appropriate structure. Use migrations and update types.

### Security
- Enforce row-level security (RLS) or equivalent server/database authorization for profiles, saved trips, trips, and stops.
- Public visitors can read only published trips and their stops.
- Signed-in users can read/update their own profile and their own allowed submissions.
- Users can read and mutate only their own saved trips.
- Only admins can approve/reject submissions, publish content, or access the full moderation queue.
- Never trust role, owner ID, or moderation status sent by the client.
- Test unauthorized requests directly, not only by checking whether buttons are hidden.
- Do not expose secrets in browser bundles, logs, error messages, or committed files.

## UX requirements
- Preserve the existing TAMROI visual language and responsive layout.
- Add clear routes/navigation for Sign in, Profile, Saved Trips, My Submissions, and Admin Review where relevant.
- Keep browsing and Google Maps navigation available without login.
- Use accessible labels, keyboard focus, confirmation for destructive actions, and clear status labels.
- Handle empty states: no saved trips, no submissions, pending review, rejected submission, and no moderation queue.
- Make errors understandable without leaking internal stack traces or sensitive data.
- Do not make up real user content or represent seed trips as actual community submissions.

## Free-first requirements
- No paid APIs, AI APIs, paid SDKs, or services that silently create charges.
- Keep the app usable within the chosen provider's free tier for MVP-scale testing.
- Document auth email limits, database/storage quotas, hosting limits, and any free-tier pause/sleep behavior.
- Prefer avatar URL over adding file storage if the existing free storage limits are too restrictive; if file upload is implemented, validate type/size and document storage limits.
- Do not add an external email provider that requires payment.
- Do not assume free tier means unlimited. Identify usage thresholds that could require a future decision.
- Update `.env.example` only with placeholder variable names and never real credentials.

## Required implementation sequence

1. Audit Phase 1 and record which existing acceptance criteria pass or fail.
2. Document the Phase 2 plan and any schema/security assumptions before implementation.
3. Add migrations and access policies without dropping existing data.
4. Implement authentication and secure profile handling.
5. Implement saved trips and ownership protections.
6. Implement user trip submissions and moderation workflow.
7. Integrate the new flows into the existing UI while preserving Phase 1 behavior.
8. Add tests for authorization, moderation status transitions, saved-trip ownership, and validation.
9. Run lint, typecheck, tests, and production build. Fix reproducible regressions.
10. Update README, `.env.example`, `docs/PHASE_STATUS.md`, and add `docs/PHASE2_STATUS.md` if useful.
11. Stop at the Phase 2 gate. Do not start Phase 3.

## Acceptance criteria

Phase 2 is complete only when:
- Visitors can still browse published trips and use map/navigation without logging in.
- Users can sign up, sign in, and sign out safely.
- A user can edit their own minimal profile but not another user's profile.
- Signed-in users can save/unsave published trips and see them on a Saved Trips page across sessions/devices.
- Duplicate saved trips are prevented.
- Users can submit trips and manage their own eligible submissions.
- New submissions remain private/pending until approved by an admin.
- Regular users cannot publish their own trips or modify moderation decisions.
- Admins can inspect, approve, and reject submissions with a rejection reason.
- Only published trips are visible publicly.
- Database/server access rules block unauthorized reads/writes even if requests are sent directly.
- Existing Phase 1 trip management, map, filters, and Google Maps links still work.
- Critical security/validation tests exist and are run.
- Lint/typecheck/tests/build results are recorded truthfully.
- Free-tier limitations and deployment/auth setup are documented.
- No Phase 3 features are implemented.

## Final report

At completion, report:
1. Phase 1 audit results and regressions fixed.
2. Phase 2 features implemented.
3. Migrations and access policies added.
4. Admin provisioning and environment setup steps.
5. Tests and commands actually run, with results.
6. Free-tier quotas and possible cost risks.
7. Known limitations and incomplete criteria.

Do not mark work complete unless it has been implemented and verified. If blocked, explain the precise blocker and leave the app in the safest functional state.
