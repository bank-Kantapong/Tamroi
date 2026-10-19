# TAMROI — Project Instructions for AI Coding Agents

## 1. Product overview

TAMROI (ตามรอย) is a free-to-use trip discovery web app. People browse curated trips, inspect the route on an interactive map, view each stop's photos and details, and open the selected route in Google Maps.

The product's core value is a ready-to-follow itinerary—not just a list of places.

## 2. Current scope: Phase 1 only

**Implement Phase 1 (MVP) only. Do not start Phase 2 or Phase 3.**

Phase 1 includes:
- Home page listing published trips.
- Trip search and practical filters.
- Trip detail page with ordered stops and interactive map.
- Markers numbered in itinerary order and a route line connecting stops.
- Selecting a stop shows its name, description, photo, coordinates, suggested duration, suggested time, and estimated cost where available.
- Open the whole itinerary in Google Maps, open navigation to one stop, and copy coordinates.
- A protected admin area to create, edit, publish/unpublish, reorder, and delete trips and stops.
- Responsive, accessible UI for desktop and mobile.
- Database-backed content and clear empty/loading/error states.
- Seed/demo content that is clearly identified as sample content and can be replaced through admin tools.

Do not implement:
- Public user trip submissions or community publishing.
- User profiles, public registration, social login, or user-generated content.
- Favorites synced across devices.
- Reviews, ratings, comments, likes, followers, or public reports.
- AI features, recommendations powered by AI, chatbots, or paid APIs.
- Booking, payments, subscriptions, advertising, or analytics that require paid plans.
- Route optimization or live traffic calculations requiring a paid API.
- Features for later phases unless specifically requested by the project owner.

## 3. Cost constraint: free-first

The owner requires the app to cost $0 to run during initial development and MVP testing, excluding an optional domain name.

- Prefer open-source libraries and free tiers with clearly documented limits.
- Do not add paid APIs, paid SDKs, paid plugins, or services that require a credit card just to test the MVP.
- Do not assume any free tier is unlimited or permanently free. Document quotas, sleep/pause behavior, usage restrictions, and likely upgrade triggers.
- Do not make external paid API calls for maps, directions, geocoding, image generation, or AI.
- Use Leaflet with OpenStreetMap-compatible tiles for the in-app map. Follow the selected tile provider's usage policy; do not treat the public OSM tile server as unlimited production infrastructure.
- Use Google Maps URLs to open navigation. Do not use Google Maps JavaScript API or Directions API for the MVP.
- Avoid requiring geocoding: admins should be able to enter latitude and longitude directly. If a free geocoding provider is considered, make it optional and document its limits and acceptable-use policy.
- Use images only when the project has permission to display them. Do not scrape websites or hotlink images without permission. Provide image URL input and a graceful placeholder if a photo is missing.
- Prefer a database and hosting provider with a usable free tier, such as Supabase and Netlify/Vercel, after checking their current limitations. Keep provider-specific code isolated where practical.
- Never silently introduce a service that could incur charges. Explain any trade-off before adding it.

## 4. Architecture and engineering principles

Use the repository's existing conventions if a project already exists. Inspect it before making changes. Do not replace working infrastructure without a clear reason.

If starting from an empty repository, prefer:
- Next.js with TypeScript.
- A maintainable component structure.
- Leaflet for interactive maps.
- PostgreSQL via a free-tier hosted database such as Supabase, if available; otherwise propose the simplest free, reliable alternative before committing.
- Server-side validation for admin mutations.
- Environment variables for secrets; commit only `.env.example`, never real credentials.

General rules:
- Build a real, end-to-end application, not a static mockup.
- Do not hardcode all trip data into UI components. Store trip and stop records in the database or an explicitly documented local seed/data layer.
- Keep route order explicit with a numeric `sequence` field.
- Store coordinates as numeric latitude/longitude and validate their ranges.
- Use stable IDs, slugs, timestamps, and clear relationships.
- Separate public read access from privileged admin mutations.
- Never expose database service-role keys or other secrets to client code.
- Validate and sanitize inputs on the server. Enforce authorization on every admin write endpoint/action.
- Do not rely on hiding admin buttons as security.
- Include useful loading, empty, validation, success, and error states.
- Optimize images and avoid unnecessary client-side JavaScript.
- Make the layout responsive and keyboard accessible.
- Use semantic HTML, labels for form controls, visible focus states, and adequate contrast.
- Avoid overengineering. Prefer the smallest maintainable solution that satisfies the acceptance criteria.

## 5. Suggested data model

Adapt to the chosen database, but preserve these concepts and relationships.

### trips
- id
- title
- slug (unique)
- short_description
- description
- cover_image_url (nullable)
- province
- category
- duration_label or duration_hours
- budget_min (nullable)
- budget_max (nullable)
- travel_mode (e.g. driving, walking, transit)
- status (draft or published)
- created_at
- updated_at

### trip_stops
- id
- trip_id (foreign key)
- place_name
- description
- latitude
- longitude
- sequence
- image_url (nullable)
- estimated_minutes (nullable)
- suggested_arrival_time (nullable)
- estimated_cost (nullable)
- notes (nullable)
- created_at
- updated_at

Add only tables needed for Phase 1, such as a minimal admin identity/role mechanism if required by the chosen provider. Do not create future-phase tables just because they might eventually be useful.

## 6. Route and map behavior

- Display stop markers in itinerary order (1, 2, 3...).
- Draw a line connecting stops in that same order. Do not imply that this is a road-following route if it is only a straight polyline between coordinates.
- Selecting a marker or stop list item should highlight the corresponding stop and show its details.
- Provide a whole-trip Google Maps URL using the supported Google Maps URLs format with origin, destination, waypoints, and travel mode where appropriate.
- Encode URL parameters correctly. Do not concatenate unescaped user input into URLs.
- Provide a per-stop navigation action and a copy-coordinates action.
- Google Maps may limit the number of waypoints and may behave differently by device/browser. Handle long itineraries by splitting them into sequential route segments or providing a clear fallback.
- Do not claim travel times, live traffic, or road-accurate routing unless a reliable source actually provides it.
- Ensure map tiles and attribution are visible as required by the provider's license and terms.

## 7. Admin area

Phase 1 requires a private admin area for managing curated content:
- Create and edit trips.
- Manage stops for a trip.
- Add/edit/delete stops and reorder them.
- Set trip status to draft or published.
- Validate required fields and coordinate ranges.
- Preview the public trip page before publishing where practical.

The admin area must be protected by actual authentication/authorization. Use the simplest secure solution compatible with the chosen free tier. Do not create public self-service registration in Phase 1. Document how the initial admin account is configured securely.

## 8. Quality requirements

Before declaring Phase 1 complete:
- Run linting and type checks.
- Run available unit/integration tests.
- Build the production bundle.
- Fix errors introduced by the implementation.
- Test core flows on mobile and desktop sizes.
- Verify that unpublished trips do not appear publicly.
- Verify that non-admin users cannot mutate trip or stop records.
- Verify create, edit, reorder, publish/unpublish, and delete flows.
- Verify Google Maps links, URL encoding, and coordinate copying.
- Verify map behavior when stops have missing images or invalid/incomplete optional fields.
- Add tests for key validation and route URL generation where practical.
- Update README with local setup, environment variables, migrations/seed instructions, admin setup, deployment steps, and free-tier limitations.

Do not claim a check passed unless it was actually run. If a check cannot run, state why and give the exact command needed.

## 9. Required working method

1. Inspect the repository and existing files first.
2. Summarize the current state and identify missing decisions or blockers.
3. Create a short implementation plan for Phase 1 only.
4. Implement in small, testable steps.
5. Run checks after meaningful changes.
6. Keep documentation and `.env.example` up to date.
7. Maintain a `docs/PHASE_STATUS.md` checklist for Phase 1. Mark an item complete only when implemented and verified.
8. If a requirement is ambiguous, choose the simplest safe option and document the assumption. Ask the owner only when the decision blocks implementation or could cause cost/security risk.
9. Do not stop after creating a plan or visual mockup. Continue through the implementation and verification unless blocked by missing credentials or a genuine external dependency.
10. At the end, report: features implemented, important files changed, commands/tests run and their results, setup steps, known limitations, and remaining Phase 1 tasks.

## 10. Phase gate

**Do not begin Phase 2 or Phase 3 until the owner explicitly approves moving on.**

When Phase 1 is complete, stop. Provide a completion report and propose next steps, but do not implement them automatically.
