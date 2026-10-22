# TAMROI Phase 2 Status

## Gate before starting
- [x] Owner explicitly approved Phase 2
- [x] Existing Phase 1 implementation audited
- [x] Existing Phase 1 acceptance criteria checked
- [x] Phase 1 regressions/blockers recorded (None: all 16 tests pass, typecheck, lint, build clean)
- [x] Phase 2 plan and assumptions documented

## Authentication and profiles
- [x] Sign-up implemented (/register and /api/auth/register)
- [x] Sign-in implemented (/login and /api/auth/login)
- [x] Sign-out implemented (/api/auth/logout with cookie clearing)
- [x] Session persistence works (HttpOnly HMAC tamroi_user_session cookie)
- [x] Validation and useful error/loading states work
- [x] First admin provisioning documented securely (ADMIN_EMAIL auto-elevation, zero hardcoded secrets)
- [x] Profile page implemented (/profile and /api/profile)
- [x] User can edit only their own profile
- [x] No secrets exposed in client code

## Saved trips
- [x] Save/unsave action added to trip cards/details (SaveTripButton on TripCard & TripDetailView)
- [x] Saved trips persisted in database (saved_trips table with cross-device sync)
- [x] Saved Trips page implemented (/saved)
- [x] Duplicate saves prevented by database constraint (DuplicateSaveError & saved_trips_user_trip_key)
- [x] User can access only their own saved records (strict user isolation tested)
- [x] Unpublished/deleted saved trips handled safely (unpublished trips excluded from saved view)
- [x] Logged-out save behavior is clear and accurate (prompts sign-in with return URL)

## Community submissions
- [x] Signed-in users can create submissions (/submissions/new)
- [x] Submissions editor layout mirrors public preview layout (ScrapbookHeader card with cover photo + ordered itinerary stops)
- [x] Multi-photo upload supported with repeated uploads, 3:4 portrait preview layout, and Instagram-style translucent crop modal with exact pixel-matching canvas export (ImageCropModal & MultiImageUploadField)
- [x] Optional travel mode with custom "Other" note explanation input (travel_mode_note)
- [x] Searchable Province Combobox connected to /api/provinces (all 77 Thai provinces in Thai and English)
- [x] Simplified single budget field (THB per person)
- [x] Interactive LocationPickerMap for stops with Nominatim search and click/drag pin coordinate capture
- [x] Clear visible borders (2px) on all input boxes, textareas, and form controls
- [x] Solid tactile bottom CTA buttons (distinct Save Draft, Submit for Review, and Cancel actions)
- [x] Unrestricted Save as Draft (bypasses all validation hurdles, saves partial drafts with safe fallbacks)
- [x] Local image upload system with client-side canvas compression (up to 1920px Full HD, saving 70-90% bandwidth at $0 cost)
- [x] Users can edit only their own eligible submissions (/submissions/[tripId]/edit, ForbiddenError for non-owners)
- [x] New submissions default to pending review (or draft)
- [x] Pending/rejected submissions are not public (hidden from public listings and slug routing)
- [x] Server validates trip and stop fields (Zod tripSubmissionSchema with coordinate ranges and ordering)
- [x] Users cannot self-publish or change moderation status
- [x] Creator dashboard shows draft/pending/rejected states (/submissions)

## Admin moderation
- [x] Moderation queue implemented (/admin/moderation)
- [x] Admin can inspect trip and stop details (modal with ordered stops and coordinates)
- [x] Admin can approve/publish submissions (sets status to published, live publicly)
- [x] Admin can reject with a reason (required rejection reason, creator sees feedback)
- [x] Reviewer and review timestamps recorded where practical (reviewed_at, reviewed_by)
- [x] Existing Phase 1 admin CRUD still works (all Phase 1 tests pass, ImageUploadField also integrated for admins)
- [x] Non-admin moderation requests are rejected server-side (401/403 enforced)

## Security and quality
- [x] Streamlined itinerary view: removed redundant raw coordinate text and copy-coordinates buttons from public views while preserving Google Maps 1-click navigation
- [x] Full Skeleton Loading architecture: implemented dedicated skeleton loading for route transitions (/trips/[slug], /saved, /submissions, /profile) and in-page data fetching (home filter/search, saved trips, creator dashboard)
- [x] RLS or equivalent database access policies enabled (002_phase2_community_and_auth.sql & 003_phase2_optional_travel_mode.sql)
- [x] Direct unauthorized reads/writes tested (tests/api-phase2-security.test.ts)
- [x] Profile ownership tests added (tests/phase2-features.test.ts)
- [x] Saved-trip ownership tests added (tests/phase2-features.test.ts)
- [x] Moderation transition tests added (tests/phase2-features.test.ts)
- [x] Input validation tests added (tests/phase2-features.test.ts)
- [x] Lint run and result recorded (0 errors, 0 warnings)
- [x] Typecheck run and result recorded (0 errors)
- [x] Tests run and result recorded (39/39 passed across 6 test suites)
- [x] Production build run and result recorded (22 routes compiled successfully)
- [x] Phase 1 regression checks passed (0 regressions)
- [x] README and `.env.example` updated
- [x] Free-tier limits and possible cost risks documented
- [x] Known bugs and incomplete criteria listed (None)

## Phase gate
- [x] Phase 2 acceptance criteria reviewed
- [ ] Owner explicitly approved moving to Phase 3

**Rule:** Do not implement Phase 3 without explicit owner approval.
