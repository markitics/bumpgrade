import {
  audienceBroadcastDeliveryBatchApiRoute,
  audienceBroadcastDeliveryQueueMessageApiRoute,
  audienceBroadcastDispatchAttemptApiRoute,
  audienceBroadcastDispatchPreflightApiRoute,
  audienceBroadcastScheduleIntentApiRoute,
} from "@/lib/audience-broadcasts";
import { audienceCrmTimelineApiRoute, audienceCrmTimelineWriteContract } from "@/lib/audience-crm";
import { audienceOptInApiRoute, audienceOptInWriteContract } from "@/lib/audience-opt-in";
import { audienceUnsubscribeApiRoute, audienceUnsubscribeWriteContract } from "@/lib/audience-unsubscribe";

export type AudienceAutomationStatus = "draft";
export type AudienceFieldKind = "email" | "text" | "checkbox";
export type EmailStepTiming = "immediate" | "delay_hours" | "delay_days";
export type AutomationActionKind = "tag_contact" | "start_sequence" | "notify_owner" | "record_event";

export type AudienceField = {
  id: string;
  label: string;
  kind: AudienceFieldKind;
  required: boolean;
  storageBoundary: string;
};

export type SubscriberSegment = {
  id: string;
  title: string;
  status: AudienceAutomationStatus;
  source: string;
  definition: string;
  privateDataExcluded: string[];
};

export type SubscriberTag = {
  id: string;
  label: string;
  purpose: string;
};

export type LeadMagnet = {
  id: string;
  title: string;
  deliveryPromise: string;
  assetBoundary: string;
};

export type OptInForm = {
  id: string;
  slug: string;
  title: string;
  status: AudienceAutomationStatus;
  routeAnchor: string;
  sourceFunnelStepId: string;
  targetSegmentIds: string[];
  tagIds: string[];
  leadMagnetId: string;
  fields: AudienceField[];
  consentStatement: string;
  writeBoundary: string;
};

export type EmailSequenceStep = {
  id: string;
  subjectIntent: string;
  timing: EmailStepTiming;
  delayValue: number;
  goal: string;
  agentEditable: boolean;
};

export type EmailSequence = {
  id: string;
  title: string;
  status: AudienceAutomationStatus;
  trigger: string;
  linkedFormId: string;
  steps: EmailSequenceStep[];
  writeBoundary: string;
};

export type AutomationAction = {
  id: string;
  kind: AutomationActionKind;
  targetId: string;
  summary: string;
};

export type AutomationRule = {
  id: string;
  title: string;
  status: AudienceAutomationStatus;
  triggerEvent: string;
  conditions: string[];
  actions: AutomationAction[];
  writeBoundary: string;
};

export type BroadcastDraft = {
  id: string;
  title: string;
  status: AudienceAutomationStatus;
  audienceScope: string;
  approvalBoundary: string;
};

export type AudienceAutomationWorkspace = {
  id: string;
  slug: string;
  title: string;
  status: AudienceAutomationStatus;
  issue: number;
  parentIssue: number;
  sourceDataRoute: string;
  previewRoute: string;
  linkedFunnelRoute: string;
  linkedOfferRoute: string;
  linkedProductRoute: string;
  revisionId: string;
  summary: string;
  segments: SubscriberSegment[];
  tags: SubscriberTag[];
  leadMagnets: LeadMagnet[];
  forms: OptInForm[];
  sequences: EmailSequence[];
  automations: AutomationRule[];
  broadcastDrafts: BroadcastDraft[];
  unsubscribeManagement: typeof audienceUnsubscribeWriteContract;
  crmTimeline: typeof audienceCrmTimelineWriteContract;
  sequenceScheduleIntentApiRoute: "/api/admin/audience/sequences/schedule-intents";
  sequenceDeliveryBatchApiRoute: "/api/admin/audience/sequences/delivery-batches";
  sequenceDeliveryQueueMessageApiRoute: "/api/admin/audience/sequences/delivery-queue-messages";
  sequenceDispatchPreflightApiRoute: "/api/admin/audience/sequences/dispatch-preflights";
  broadcastScheduleIntentApiRoute: typeof audienceBroadcastScheduleIntentApiRoute;
  broadcastDeliveryBatchApiRoute: typeof audienceBroadcastDeliveryBatchApiRoute;
  broadcastDeliveryQueueMessageApiRoute: typeof audienceBroadcastDeliveryQueueMessageApiRoute;
  broadcastDispatchPreflightApiRoute: typeof audienceBroadcastDispatchPreflightApiRoute;
  broadcastDispatchAttemptApiRoute: typeof audienceBroadcastDispatchAttemptApiRoute;
  audienceImportIntentApiRoute: "/api/admin/audience/import-intents";
  audienceImportPreflightApiRoute: "/api/admin/audience/import-preflights";
  writeBoundary: string;
  validation: string[];
};

export const audienceAutomationUpdatedAt = "2026-05-23";

export const audienceAutomationWorkspace: AudienceAutomationWorkspace = {
  id: "audience-automation-workspace-indie-launch",
  slug: "indie-launch-waitlist",
  title: "Indie launch waitlist and nurture",
  status: "draft",
  issue: 253,
  parentIssue: 17,
  sourceDataRoute: "/audience/source-data",
  previewRoute: "/audience/indie-launch-waitlist",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  linkedOfferRoute: "/offers/indie-launch-stack",
  linkedProductRoute: "/products/indie-launch-library",
  revisionId: "audience-automation-revision-indie-launch-2026-05-20",
  summary:
    "An audience workspace for opt-ins, consent, tags, suppression, CRM notes, launch emails, campaign checks, import planning, and practical follow-up.",
  segments: [
    {
      id: "segment-indie-launch-waitlist",
      title: "Indie launch waitlist",
      status: "draft",
      source: "Opt-in form submission after explicit consent",
      definition: "People who request the launch checklist and want follow-up about the launch offer.",
      privateDataExcluded: ["Email address", "name", "IP address", "user agent", "consent timestamp"],
    },
    {
      id: "segment-product-interested-publishers",
      title: "Product-interested publishers",
      status: "draft",
      source: "Tagged waitlist contact after product-access link click or manual import in a future confirmed workflow",
      definition: "Publishers interested in downloads, courses, memberships, or bundles.",
      privateDataExcluded: ["Clickstream detail", "subscriber identity", "purchase intent score"],
    },
  ],
  tags: [
    {
      id: "tag-lead-magnet-launch-checklist",
      label: "lead-magnet:launch-checklist",
      purpose: "Mark contacts who requested the launch checklist lead magnet.",
    },
    {
      id: "tag-source-funnel-indie-launch",
      label: "source:funnel-indie-launch",
      purpose: "Record the funnel/source context without exposing raw referral or UTM payloads.",
    },
    {
      id: "tag-intent-product-access",
      label: "intent:product-access",
      purpose: "Identify contacts who should receive product/access education later.",
    },
  ],
  leadMagnets: [
    {
      id: "lead-magnet-launch-checklist",
      title: "Launch checklist lead magnet",
      deliveryPromise: "Send a practical launch checklist after consent and email verification.",
      assetBoundary: "No private file, R2 object key, signed URL, or recipient email is exposed in this public source-data contract.",
    },
  ],
  forms: [
    {
      id: "opt-in-form-indie-launch-waitlist",
      slug: "indie-launch-waitlist",
      title: "Indie launch waitlist opt-in",
      status: "draft",
      routeAnchor: "indie-launch-waitlist-opt-in",
      sourceFunnelStepId: "funnel-step-indie-launch-opt-in",
      targetSegmentIds: ["segment-indie-launch-waitlist"],
      tagIds: ["tag-lead-magnet-launch-checklist", "tag-source-funnel-indie-launch"],
      leadMagnetId: "lead-magnet-launch-checklist",
      fields: [
        {
          id: "field-waitlist-email",
          label: "Email address",
          kind: "email",
          required: true,
          storageBoundary: "The opt-in API trims and normalizes email before validation, then stores it server-side with consent evidence.",
        },
        {
          id: "field-waitlist-name",
          label: "First name",
          kind: "text",
          required: false,
          storageBoundary: "Optional profile data must stay private and is not part of public source-data.",
        },
        {
          id: "field-waitlist-consent",
          label: "Consent to receive launch emails",
          kind: "checkbox",
          required: true,
          storageBoundary: "Consent records include timestamp, source form, idempotency key, and hashed request evidence; unsubscribe/suppression evidence is recorded through a separate public-safe endpoint.",
        },
      ],
      consentStatement:
        "I want the launch checklist and practical follow-up about Bumpgrade. I can unsubscribe later.",
      writeBoundary:
        `This form posts to ${audienceOptInApiRoute}. Unsubscribe preferences post to ${audienceUnsubscribeApiRoute}. Owner-only CRM notes, dry-run broadcast evidence, import intents, and import preflights now use separate confirmed-write APIs; export readiness is aggregate-only. Real contact imports, email delivery, broadcast sends, and private exports require future confirmed-write APIs with actor identity, explicit consent or lawful basis, idempotency, audit correlation, redaction, unsubscribe metadata, and spam-safe sending rules.`,
    },
  ],
  sequences: [
    {
      id: "sequence-indie-launch-nurture",
      title: "Indie launch nurture sequence",
      status: "draft",
      trigger: "opt-in-form-indie-launch-waitlist submitted with confirmed consent",
      linkedFormId: "opt-in-form-indie-launch-waitlist",
      steps: [
        {
          id: "email-step-deliver-checklist",
          subjectIntent: "Deliver the requested launch checklist",
          timing: "immediate",
          delayValue: 0,
          goal: "Fulfill the lead magnet promise with a clear checklist delivery.",
          agentEditable: true,
        },
        {
          id: "email-step-map-funnel",
          subjectIntent: "Show how the funnel, offer, and product records connect",
          timing: "delay_hours",
          delayValue: 24,
          goal: "Show subscribers how the funnel, offer, and product path connect.",
          agentEditable: true,
        },
        {
          id: "email-step-invite-sandbox-offer",
          subjectIntent: "Invite a safe checkout review",
          timing: "delay_days",
          delayValue: 3,
          goal: "Point to the checkout offer only after consent and clear buyer expectations.",
          agentEditable: true,
        },
      ],
      writeBoundary:
        "Sequence drafts and issue #351 delivery-readiness counts are source-data only. Sending, scheduling, suppression checks, recipient payloads, unsubscribe URLs, and contact-specific personalization require future confirmed-write email infrastructure.",
    },
  ],
  automations: [
    {
      id: "automation-enroll-waitlist-nurture",
      title: "Enroll consenting waitlist contacts in nurture",
      status: "draft",
      triggerEvent: "audience.opt_in.created",
      conditions: [
        "Consent checkbox is true.",
        "Email passes normalization and validation.",
        "Idempotency key has not already enrolled this email/form pair.",
      ],
      actions: [
        {
          id: "automation-action-tag-lead-magnet",
          kind: "tag_contact",
          targetId: "tag-lead-magnet-launch-checklist",
          summary: "Apply the launch-checklist tag after consent is recorded.",
        },
        {
          id: "automation-action-start-sequence",
          kind: "start_sequence",
          targetId: "sequence-indie-launch-nurture",
          summary: "Start the draft nurture sequence once safe delivery infrastructure exists.",
        },
        {
          id: "automation-action-record-event",
          kind: "record_event",
          targetId: "event-audience-opt-in-created",
          summary: "Record a future analytics event without exposing private subscriber fields.",
        },
      ],
      writeBoundary:
        "Automation execution is disabled. Future runs need confirmed consent, unsubscribe checks, rate limiting, audit correlation, and failure handling before any email is sent.",
    },
  ],
  broadcastDrafts: [
    {
      id: "broadcast-draft-launch-window",
      title: "Launch window announcement",
      status: "draft",
      audienceScope: "Only subscribers who explicitly opted into the indie launch waitlist and are not unsubscribed.",
      approvalBoundary:
        "Issue #211 can inspect Queue consumer readiness for this draft, but real sending still requires verified sender alignment, provider event handling, provider rate-limit handling, provider response handling, send-payload creation, Queue producers/consumers, and audit correlation.",
    },
  ],
  unsubscribeManagement: audienceUnsubscribeWriteContract,
  crmTimeline: audienceCrmTimelineWriteContract,
  sequenceScheduleIntentApiRoute: "/api/admin/audience/sequences/schedule-intents",
  sequenceDeliveryBatchApiRoute: "/api/admin/audience/sequences/delivery-batches",
  sequenceDeliveryQueueMessageApiRoute: "/api/admin/audience/sequences/delivery-queue-messages",
  sequenceDispatchPreflightApiRoute: "/api/admin/audience/sequences/dispatch-preflights",
  broadcastScheduleIntentApiRoute: audienceBroadcastScheduleIntentApiRoute,
  broadcastDeliveryBatchApiRoute: audienceBroadcastDeliveryBatchApiRoute,
  broadcastDeliveryQueueMessageApiRoute: audienceBroadcastDeliveryQueueMessageApiRoute,
  broadcastDispatchPreflightApiRoute: audienceBroadcastDispatchPreflightApiRoute,
  broadcastDispatchAttemptApiRoute: audienceBroadcastDispatchAttemptApiRoute,
  audienceImportIntentApiRoute: "/api/admin/audience/import-intents",
  audienceImportPreflightApiRoute: "/api/admin/audience/import-preflights",
      writeBoundary:
        "Issue #103 can capture explicit-consent opt-ins, normalize subscriber email, assign seeded tags, and record draft sequence enrollment evidence. Issue #137 can inspect private subscriber rows behind owner auth and expose aggregate public redaction flags. Issue #167 can record unsubscribe/suppression evidence and mark known subscribers unsubscribed without revealing list membership. Issue #343 pauses known draft sequence enrollments after unsubscribe while public responses stay membership-safe and source-data exposes aggregate paused-sequence evidence only. Issue #351 exposes aggregate sequence delivery readiness counts without scheduling sequence steps, creating recipient payloads, personalized bodies, unsubscribe URLs, queue payloads, provider sends, or provider message IDs. Issue #354 can record owner-confirmed dry-run sequence schedule intents with exact confirmation, idempotency, workspace revision checks, sequence status checks, and expected readiness counts while still creating no delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs. Issue #358 can record owner-confirmed dry-run sequence delivery batches after sequence schedule-intent, workspace revision, sequence status, readiness, suppression, unsubscribe-footer, sender-domain, and idempotency checks while still creating no delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs. Issue #360 can record owner-confirmed dry-run sequence queue-message evidence from a sequence delivery batch while still creating no Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs. Issue #362 can record owner-confirmed sequence dispatch preflight evidence from a sequence queue-message record while still dispatching no Cloudflare Queue messages, creating no queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs. Issue #169 can create owner-only CRM timeline notes with exact confirmation, idempotency, and expected subscriber-status checks. Issue #171 can inspect suppression-aware broadcast draft readiness without creating send queues. Issue #173 can record owner-confirmed dry-run broadcast schedule intents with idempotency, exact confirmation, draft revision checks, and expected readiness counts while still creating no send queue rows. Issue #175 can inspect broadcast preview and unsubscribe-footer safety without personalized bodies or provider sends. Issue #177 can inspect delivery queue readiness metadata without queue producers, recipient payloads, or provider sends. Issue #183 can record owner-confirmed delivery-batch dry runs after schedule-intent, queue, preview, suppression, and stale-state checks while still creating no recipient payloads, queue messages, or provider sends. Issue #189 can record owner-confirmed dry-run queue-message evidence from a delivery batch without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs. Issue #191 can record owner-confirmed dispatch preflight evidence from a queue-message record without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs. Issue #197 can record owner-confirmed dispatch attempt receipts from a dispatch preflight without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs. Issue #199 can inspect sender-domain readiness gates without private DNS credentials, raw DNS records, provider secrets, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs. Issue #201 can inspect provider-event readiness gates without provider secrets, raw provider payloads, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs. Issue #203 can inspect provider rate-limit readiness gates without provider secrets, provider limit secrets, raw provider payloads, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs. Issue #205 can inspect provider response readiness gates without provider secrets, raw response bodies, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs. Issue #207 can inspect send-payload readiness gates without raw recipient identity, recipient payloads, personalized bodies, raw payload bodies, Cloudflare Queue producers, provider sends, provider responses, or provider message IDs. Issue #209 can inspect Queue producer readiness gates without enabling Cloudflare Queue producers, creating Queue messages, creating queue payload bodies, creating recipient payloads, sending through a provider, creating provider responses, or creating provider message IDs. Issue #211 can inspect Queue consumer readiness gates without enabling Cloudflare Queue consumers, consuming or acking Queue messages, creating retry/dead-letter rows, reading queue payload bodies, creating recipient payloads, sending through a provider, creating provider responses, or creating provider message IDs. Issue #253 can record owner-confirmed import intent metadata with exact confirmation, idempotency, workspace revision/status checks, aggregate counts, and hashed private notes while creating no subscribers, raw contact rows, sequence enrollments, or sends. Issue #259 can record owner-confirmed import preflight evidence against a selected import intent with exact confirmation, idempotency, workspace stale-state checks, source-label checks, aggregate eligibility/suppression/consent/malformed counts, and hashed private notes while creating no subscribers, raw contact rows, sequence enrollments, exports, or sends. Issue #347 exposes aggregate audience export readiness counts without export files, raw emails, subscriber IDs, or export URLs. Real contact imports, real email sends, private exports, CRM automation, and direct agent writes require actor identity, explicit consent or lawful basis, idempotency, audit correlation, stale-state checks, redaction, suppression-list checks, unsubscribe footers, sender-domain safety, provider-event safety, provider rate-limit safety, provider response safety, send-payload safety, Queue producer safety, Queue consumer safety, queue safety, and provider limits.",
  validation: [
    "/audience/source-data returns seeded audience segments, forms, tags, sequences, automations, and write boundaries.",
    "/audience/indie-launch-waitlist renders the opt-in and nurture preview.",
    "/api/audience/opt-in stores normalized subscriber, consent, tag, and draft sequence enrollment evidence.",
    "/api/audience/unsubscribe stores suppression evidence without exposing list membership.",
    "/audience/source-data exposes aggregate sequence delivery readiness without queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.",
    "/api/admin/audience/sequences/schedule-intents stores owner-confirmed dry-run sequence schedule intents without delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.",
    "/api/admin/audience/sequences/delivery-batches stores owner-confirmed dry-run sequence delivery batches without delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.",
    "/api/admin/audience/sequences/delivery-queue-messages stores owner-confirmed dry-run sequence queue-message evidence without Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
    "/api/admin/audience/sequences/dispatch-preflights stores owner-confirmed dry-run sequence dispatch preflight evidence without Cloudflare Queue dispatch, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
    "/api/admin/audience/notes stores owner-only CRM timeline notes with public aggregate redaction.",
    "Broadcast readiness is calculated from D1 subscriber, consent, and suppression evidence without creating send queue rows.",
    "/api/admin/audience/broadcasts/schedule-intents stores owner-confirmed dry-run schedule intents without recipient payloads, queues, or provider message IDs.",
    "Broadcast preview safety is stored from D1 without personalized bodies, recipient payloads, send queue rows, or provider message IDs.",
    "Broadcast delivery queue readiness is stored from D1 without queue producer rows, recipient payloads, provider sends, or provider message IDs.",
    "/api/admin/audience/broadcasts/delivery-batches stores owner-confirmed delivery-batch dry runs without recipient payloads, queue messages, provider sends, or provider message IDs.",
    "/api/admin/audience/broadcasts/delivery-queue-messages stores owner-confirmed dry-run queue-message evidence without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
    "/api/admin/audience/broadcasts/dispatch-preflights stores owner-confirmed dispatch preflight evidence without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
    "/api/admin/audience/broadcasts/dispatch-attempts stores owner-confirmed dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
    "Sender-domain readiness records expose SPF, DKIM, DMARC, reply-path, bounce-handling, and provider-send gates without private DNS credentials, raw DNS records, provider secrets, queue producers, recipient payloads, provider responses, or provider message IDs.",
    "Provider-event readiness records expose bounce, complaint, delivery-event, suppression-update, and raw-payload storage gates without provider secrets, raw provider payloads, recipient payloads, provider responses, or provider message IDs.",
    "Provider rate-limit readiness records expose throttle windows, retry/backoff, queue backpressure, and provider-limit policies without provider secrets, provider limit secrets, raw provider payloads, recipient payloads, provider responses, or provider message IDs.",
    "Provider response readiness records expose accepted/transient/permanent response handling, retry decision, message-id storage, and response-body storage policies without provider secrets, raw response bodies, recipient payloads, provider responses, or provider message IDs.",
    "Send-payload readiness records expose payload scope, consent/suppression recheck, unsubscribe footer, personalization token, and audit policies without raw recipient identity, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider responses, or provider message IDs.",
    "Queue producer readiness records expose binding, producer mode, payload dependency, consumer dependency, idempotency, audit, and backpressure gates without enabling Cloudflare Queue producers, creating Queue messages, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
    "Queue consumer readiness records expose consumer mode, producer dependency, ack, retry, dead-letter, provider handoff, idempotency, and audit gates without enabling Cloudflare Queue consumers, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, provider sends, provider responses, or provider message IDs.",
    "/api/admin/audience/import-intents stores owner-confirmed import intent metadata without raw contact rows, raw emails, sequence enrollments, email delivery, or private note exposure.",
    "/api/admin/audience/import-preflights stores owner-confirmed import preflight evidence without raw contact rows, raw emails, subscriber writes, sequence enrollments, exports, email delivery, or private note exposure.",
    "/audience/source-data exposes aggregate export readiness without export files, raw emails, subscriber IDs, or export URLs.",
    "/agent-docs/source-data lists the audience automation read contract for future MCP resources.",
  ],
};

export const audienceAutomationWorkspaces = [audienceAutomationWorkspace];

export function getAudienceAutomationWorkspaceBySlug(slug: string) {
  return audienceAutomationWorkspaces.find((workspace) => workspace.slug === slug) ?? null;
}

export const audienceAutomationSourceData = {
  id: "bumpgrade-audience-automation-source-data",
  updatedAt: audienceAutomationUpdatedAt,
  status: "sequence-dispatch-preflight-dry-run-ready",
  issue: 362,
  parentIssue: 17,
  generatedFrom: "src/lib/audience-automation.ts",
  routes: [
    "/audience/source-data",
    audienceOptInApiRoute,
    audienceUnsubscribeApiRoute,
    audienceCrmTimelineApiRoute,
    "/api/admin/audience/sequences/schedule-intents",
    "/api/admin/audience/sequences/delivery-batches",
    "/api/admin/audience/sequences/delivery-queue-messages",
    "/api/admin/audience/sequences/dispatch-preflights",
    audienceBroadcastScheduleIntentApiRoute,
    audienceBroadcastDeliveryBatchApiRoute,
    audienceBroadcastDeliveryQueueMessageApiRoute,
    audienceBroadcastDispatchPreflightApiRoute,
    audienceBroadcastDispatchAttemptApiRoute,
    "/api/admin/audience/import-intents",
    "/api/admin/audience/import-preflights",
    "/admin/audience",
    ...audienceAutomationWorkspaces.map((workspace) => workspace.previewRoute),
  ],
  stableIds: [
    "subscriberId",
    "subscriberInspectionId",
    "subscriberSegmentId",
    "optInFormId",
    "leadMagnetId",
    "subscriberTagId",
    "emailSequenceId",
    "sequenceEnrollmentPauseId",
    "sequenceDeliveryReadinessId",
    "sequenceScheduleIntentId",
    "sequenceDeliveryBatchId",
    "sequenceDeliveryQueueMessageId",
    "sequenceDispatchPreflightId",
    "automationRuleId",
    "broadcastDraftId",
    "consentRecordId",
    "suppressionEntryId",
    "timelineEntryId",
    "broadcastReadinessId",
    "broadcastScheduleIntentId",
    "broadcastPreviewSafetyId",
    "broadcastQueueReadinessId",
    "broadcastDeliveryBatchId",
    "broadcastDeliveryQueueMessageId",
    "broadcastDispatchPreflightId",
    "broadcastDispatchAttemptId",
    "broadcastSenderDomainReadinessId",
    "broadcastProviderEventReadinessId",
    "broadcastProviderRateLimitReadinessId",
    "broadcastProviderResponseReadinessId",
    "broadcastSendPayloadReadinessId",
    "broadcastQueueProducerReadinessId",
    "broadcastQueueConsumerReadinessId",
    "audienceImportIntentId",
    "audienceImportPreflightId",
    "audienceExportReadinessId",
    "agentActionId",
  ],
  optInWrites: audienceOptInWriteContract,
  unsubscribeWrites: audienceUnsubscribeWriteContract,
  crmTimelineWrites: audienceCrmTimelineWriteContract,
  writeBoundary: audienceAutomationWorkspace.writeBoundary,
  workspaces: audienceAutomationWorkspaces,
  caveat:
    "This contract proves audience, opt-in, email sequence, automation read/preview semantics, consent-backed subscriber capture, public-safe unsubscribe/suppression evidence, unsubscribe-paused sequence enrollment aggregates from issue #343, aggregate sequence delivery-readiness evidence from issue #351, dry-run sequence schedule-intent evidence from issue #354, dry-run sequence delivery-batch evidence from issue #358, dry-run sequence queue-message evidence from issue #360, dry-run sequence dispatch-preflight evidence from issue #362, owner-only CRM timeline note evidence, suppression-aware broadcast readiness, owner-confirmed dry-run schedule intent evidence, broadcast preview/footer safety evidence, delivery queue readiness evidence, delivery-batch dry-run evidence, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intent evidence, owner-confirmed import preflight evidence, aggregate export-readiness evidence, and aggregate owner-inspection evidence. It does not import contacts, store raw import rows, store raw emails, create subscriber rows, create sequence enrollments from imports, export private contact data, create export files, expose export URLs, schedule sequence steps, send email, dispatch Cloudflare Queue messages, execute Queue producers or consumers, create queue payload bodies, read queue payload bodies, create retry/dead-letter rows, create delivery queue rows, create recipient payloads, create personalized bodies, expose body templates, expose unsubscribe URLs, expose private DNS credentials, expose raw DNS records, expose provider secrets, expose provider limit secrets, expose raw provider payloads, expose raw provider response bodies, expose raw payload bodies, expose import private notes, publicly expose private contact data, automate CRM actions, or provide direct confirmed-write public agent APIs.",
};
