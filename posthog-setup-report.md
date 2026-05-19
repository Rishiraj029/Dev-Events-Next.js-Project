<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project. Here is a summary of all changes made:

- **`instrumentation-client.ts`** — Already present; initializes PostHog via `posthog-js` using the `/ingest` reverse proxy, with exception capture and debug mode enabled.
- **`next.config.ts`** — Already present; configures Next.js rewrites to proxy `/ingest/static/*`, `/ingest/array/*`, and `/ingest/*` to PostHog's US servers, with `skipTrailingSlashRedirect: true`.
- **`components/ExploreBtn.tsx`** — Already had `posthog.capture('explore_events_clicked')` on CTA button click.
- **`components/EventCard.tsx`** — Added `'use client'` directive, imported `posthog-js`, and added `posthog.capture('event_card_clicked', { title, slug, location, date })` on link click.
- **`components/Navbar.tsx`** — Added `'use client'` directive, imported `posthog-js`, and added `posthog.capture('nav_link_clicked', { link_label, href })` on each navigation link click.
- **`.env.local`** — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` confirmed and updated.
- **`posthog-js`** — Installed as a project dependency.

## Events

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the 'Explore Events' CTA button on the home page, indicating intent to browse events. Top of the discovery funnel. | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view its detail page. Captures event title, slug, location, and date to measure which events attract the most interest. | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link in the Navbar (Home, Event, Create Event). Tracks navigation intent and interest in creating events. | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1602030)
- [Explore Events Clicked](/insights/O3j3HgtZ) — Daily trend of the top-of-funnel CTA click
- [Event Card Clicks Over Time](/insights/asmS1BZo) — Trend broken down by event title to see which events attract the most interest
- [Navigation Link Clicks by Label](/insights/MjEIuJ4Y) — Bar chart of nav clicks broken down by link label (Home, Event, Create Event)
- [Event Discovery Funnel](/insights/YBn8jyed) — Conversion funnel from `explore_events_clicked` to `event_card_clicked`
- [Unique Users Engaging with Events](/insights/v3wfwKg0) — Daily unique users who explored vs clicked event cards

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
