# TAMROI Phase Status

## Phase 1 — MVP

### Foundation
- [x] Repository audited; existing conventions preserved where reasonable
- [x] Stack and free-tier assumptions documented
- [x] Database schema/migrations created
- [x] Seed/demo data added and clearly identified
- [x] `.env.example` added with no real secrets
- [x] README setup instructions written

### Public trip discovery
- [x] Home page lists published trips
- [x] Search works
- [x] Province/category/duration/budget filters work where data is available
- [x] Trip detail route uses a unique slug
- [x] Stops appear in the correct order
- [x] Loading, empty, not-found, and error states work

### Map and navigation
- [x] Leaflet map renders with required tile attribution
- [x] Markers are numbered in itinerary order
- [x] Stop line follows the itinerary order
- [x] Selecting a map marker selects the matching stop
- [x] Selecting a stop selects/highlights the matching marker
- [x] Stop details display correctly
- [x] Google Maps whole-trip URL works and encodes parameters
- [x] Long routes have a segmented/fallback behavior
- [x] Individual stop navigation works
- [x] Copy coordinates works with success/error feedback

### Admin
- [x] Admin authentication/authorization is implemented
- [x] Admin can create a trip
- [x] Admin can edit a trip
- [x] Admin can delete a trip
- [x] Admin can publish/unpublish a trip
- [x] Admin can add/edit/delete stops
- [x] Admin can reorder stops
- [x] Server-side validation is implemented
- [x] Unauthorized writes are blocked
- [x] Draft trips are hidden from public pages

### Quality and release
- [x] Mobile and desktop layouts checked
- [x] Accessibility basics checked
- [x] Missing images and optional fields handled
- [x] Critical tests added
- [x] Lint run and result recorded
- [x] Typecheck run and result recorded
- [x] Tests run and result recorded
- [x] Production build run and result recorded
- [x] Deployment and free-tier limitations documented
- [x] Remaining bugs/blockers listed

## Phase gate

- [x] Phase 1 acceptance criteria reviewed
- [ ] Owner explicitly approved moving to Phase 2

**Rule:** Do not implement Phase 2 or Phase 3 without explicit owner approval.
