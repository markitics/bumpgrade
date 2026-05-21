# Analytics And Experiments

Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, #271, #284, #286, #288, and #290 add the first
analytics and experimentation contract, the first privacy-safe event capture
path, the first deterministic experiment assignment path, the first aggregate
funnel conversion report, the first browser-side funnel page-view beacon, the
first aggregate variant and source attribution page-view evidence, and the first
dashboard-visible source attribution breakdown, fixed aggregate source and
conversion time-window filters, owner-confirmed experiment decision evidence,
aggregate report export metadata, owner-reviewed cohort comparison evidence,
owner-reviewed alert threshold/anomaly-review evidence, and owner-reviewed
notification delivery readiness evidence, owner-confirmed notification inbox
record evidence, owner-confirmed notification dispatch preflight evidence, and
owner-reviewed notification provider/domain readiness evidence,
owner-reviewed notification content/consent readiness evidence, and
owner-reviewed notification send-payload readiness evidence
for issue #18.

## Live Routes

- `/analytics/source-data`: public-safe JSON for the seeded analytics dashboard.
  Supports `?window=all`, `?window=24h`, `?window=7d`, and `?window=30d` for
  aggregate source and conversion rows.
- `/analytics/indie-launch-dashboard`: crawlable preview for funnel metrics and
  A/B assignment semantics, with a browser-hydrated aggregate source attribution
  panel and fixed-window controls.
- `/api/analytics/events`: public POST endpoint for seeded analytics events.
- `/api/analytics/assignments`: public POST endpoint for seeded experiment
  assignments.
- `/api/admin/analytics/experiment-decisions`: owner-gated GET/POST endpoint for
  confirmed experiment decision evidence.
- `/api/admin/analytics/notification-inbox-records`: owner-gated GET/POST
  endpoint for confirmed notification inbox evidence.
- `/api/admin/analytics/notification-dispatch-preflights`: owner-gated GET/POST
  endpoint for confirmed notification dispatch preflight evidence.
- `/api/admin/analytics/notification-provider-domain-readiness`: owner-gated
  GET/POST endpoint for reviewed notification provider/domain readiness
  evidence.
- `/api/admin/analytics/notification-content-consent-readiness`: owner-gated
  GET/POST endpoint for reviewed notification content/consent readiness
  evidence.
- `/api/admin/analytics/notification-send-payload-readiness`: owner-gated
  GET/POST endpoint for reviewed notification send-payload readiness evidence.
- `/admin/analytics`: owner-gated page for aggregate experiment decision
  and notification inbox, dispatch preflight, provider/domain readiness, and
  content/consent readiness, and send-payload readiness evidence.
- `/funnels/indie-launch-sandbox`: emits a session-idempotent seeded funnel
  page-view event through `/api/analytics/events` with deterministic variant
  evidence from `/api/analytics/assignments` and normalized UTM/source
  attribution when available.

## Current Contract

The first dashboard includes stable IDs for:

- analytics event definitions;
- metric formulas;
- aggregate funnel conversion report rows;
- experiment definitions;
- variants;
- assignment rules.
- aggregate event counts, aggregate variant event counts, aggregate assignment
  counts, aggregate source attribution counts, seeded event ingestion
  boundaries, and seeded assignment boundaries.
- fixed time-window metadata for all-time, 24-hour, 7-day, and 30-day aggregate
  source and conversion summaries.
- browser-side page-view beacon boundaries.
- dashboard-visible source attribution breakdowns.
- owner-confirmed experiment decision counts, latest public-safe decision
  metadata, selected fixed-window evidence, and redaction flags.
- aggregate report export metadata, export sections, and fixture cohort
  comparison definitions.
- owner-reviewed cohort comparison evidence with aggregate-only source rows,
  selected fixed windows, sample-size caveats, and no winner or revenue claims.
- owner-reviewed alert threshold/anomaly-review evidence with aggregate-only
  conversion rows, selected fixed windows, sample-size caveats, and no
  automated alert sends, traffic routing, winner selection, or revenue claims.
- owner-reviewed notification delivery readiness evidence with future
  owner-only channel metadata, selected fixed windows, sample-size caveats, and
  no alert sends, owner email sends, inbox writes, traffic routing, winner
  selection, or revenue claims.
- owner-confirmed notification inbox records with readiness checks, selected
  fixed windows, sample-size caveats, and no owner email sends, queue dispatch,
  customer alerts, recipient identity, email bodies, traffic routing, winner
  selection, or revenue claims.
- owner-confirmed notification dispatch preflights with current inbox-record
  checks, selected fixed windows, sample-size caveats, and no owner email sends,
  provider calls, queue dispatch, customer alerts, recipient identity, email
  bodies, provider message IDs, queue payloads, traffic routing, winner
  selection, or revenue claims.
- owner-reviewed notification provider/domain readiness records with current
  dispatch-preflight checks, selected fixed windows, sample-size caveats, and no
  provider configuration, provider secrets, sender credentials, private DNS
  credentials, provider sends, provider calls, queue dispatch, customer alerts,
  recipient identity, email bodies, provider message IDs, queue payloads,
  traffic routing, winner selection, or revenue claims.
- owner-reviewed notification content/consent readiness records with current
  provider/domain readiness checks, selected fixed windows, sample-size caveats,
  and no body templates, unsubscribe URLs, provider sends, provider calls,
  queue dispatch, customer alerts, recipient identity, email bodies, provider
  message IDs, queue payloads, traffic routing, winner selection, or revenue
  claims.
- owner-reviewed notification send-payload readiness records with current
  content/consent readiness checks, selected fixed windows, sample-size caveats,
  and no recipient payloads, personalized bodies, raw payload bodies, queue
  messages, provider responses, owner email sends, provider sends, provider
  calls, queue dispatch, customer alerts, recipient identity, email bodies,
  body templates, unsubscribe URLs, provider message IDs, queue payloads,
  traffic routing, winner selection, or revenue claims.

The current write paths store seeded analytics events and seeded experiment
assignments with source-route validation, idempotency, public-safe responses,
hashed request evidence, and aggregate-only public reporting. The public funnel
preview now records the seeded `event-funnel-page-view` event once per browser
session and funnel step through `sessionStorage` idempotency. It first requests
the seeded deterministic assignment and includes the assigned variant ID in the
page-view event when assignment succeeds. It also includes normalized UTM
fields and a coarse referrer host when present, while excluding raw referrer
URLs and raw query strings. The server ignores known bot/crawler and explicit
preview/test-suppressed traffic before creating analytics event rows. The
current report path computes visitor, conversion, and conversion-rate rows from
captured test events in the selected fixed window when samples exist, then
falls back to fixture rows only when no samples exist. Owner sessions can record
experiment decision evidence only after exact confirmation, idempotency,
dashboard revision checks, experiment status checks, aggregate assignment-count
checks, selected fixed-window evidence, and sample-size caveat acknowledgement.
Owner sessions can record notification inbox evidence only after exact
confirmation, idempotency, dashboard revision checks, notification readiness
checks, selected fixed-window sample-size checks, and sample-size caveat
acknowledgement.
Owner sessions can record notification dispatch preflight evidence only after
exact confirmation, idempotency, dashboard revision checks, notification
readiness checks, current notification inbox record checks, selected
fixed-window sample-size checks, and sample-size caveat acknowledgement.
Owner sessions can record notification provider/domain readiness evidence only
after exact confirmation, idempotency, dashboard revision checks, notification
readiness checks, current notification dispatch preflight checks, selected
fixed-window sample-size checks, and sample-size caveat acknowledgement.
Owner sessions can record notification content/consent readiness evidence only
after exact confirmation, idempotency, dashboard revision checks, notification
readiness checks, current notification provider/domain readiness checks,
selected fixed-window sample-size checks, and sample-size caveat
acknowledgement.
Owner sessions can record notification send-payload readiness evidence only
after exact confirmation, idempotency, dashboard revision checks, notification
readiness checks, current notification content/consent readiness checks,
selected fixed-window sample-size checks, and sample-size caveat
acknowledgement.
The current export contract exposes aggregate report section metadata only:
event aggregates, source attribution aggregates, variant aggregates, assignment
aggregates, funnel conversion rows, experiment decision evidence, fixture
cohort definitions, owner-reviewed cohort comparison evidence, and
owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed
notification delivery readiness evidence, owner-confirmed notification inbox
record evidence, owner-confirmed dispatch preflight evidence, and owner-reviewed
provider/domain readiness evidence, and owner-reviewed content/consent
readiness evidence, and owner-reviewed send-payload readiness evidence. The cohort
comparison, threshold review, notification readiness, notification inbox
records, dispatch preflights, provider/domain readiness records, and
content/consent readiness records, and send-payload readiness records are
directional evidence with sample-size
caveats; agents must not treat them as winner decisions, statistically
meaningful proof, customer alert triggers, owner email sends, provider sends,
provider configuration, verified sender-domain claims, body template delivery,
unsubscribe URL delivery, queue dispatch, or
revenue claims. These paths do not assign cookies, expose contact-level
analytics, expose
raw event or assignment rows, expose raw campaign/referrer payloads, create raw
analytics exports, send automated alerts, send owner email, call providers, dispatch queues,
create queue messages, create recipient payloads, create personalized bodies,
store raw payload bodies, create customer alerts, expose body templates,
expose unsubscribe URLs, route experiment traffic, make automated winner decisions, make revenue
claims, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route, preview route, event capture boundary,
page-view beacon boundary, dashboard-visible aggregate source attribution
evidence, fixed-window metadata, aggregate variant evidence, assignment
boundary, owner-confirmed experiment decision evidence, and aggregate conversion
report rows, aggregate report export metadata, and owner-reviewed cohort
comparison evidence, and owner-reviewed alert threshold/anomaly-review evidence
and owner-reviewed notification delivery readiness evidence, plus
owner-confirmed notification inbox aggregate evidence and owner-confirmed
dispatch preflight aggregate evidence, plus owner-reviewed provider/domain
readiness aggregate evidence, plus owner-reviewed content/consent readiness
aggregate evidence, plus owner-reviewed send-payload readiness aggregate
evidence, to understand
analytics and experiment semantics. Direct public agent analytics writes,
custom events, raw campaign/referrer reporting, tracking cookies, raw analytics
exports, automated alert sends, owner email sends, provider sends, provider
configuration, provider secrets, private DNS credentials, body templates,
unsubscribe URLs, queue dispatch, queue messages, recipient payloads,
personalized bodies, raw payload bodies, customer alerts,
experiment traffic routing, automated winners, or revenue claims require
authenticated confirmed-write APIs with actor identity, privacy review,
idempotency, stale-state checks, audit correlation, redaction, retention
limits, and sample-size caveats.
