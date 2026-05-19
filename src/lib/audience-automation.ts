import { audienceOptInApiRoute, audienceOptInUpdatedAt, audienceOptInWriteContract } from "@/lib/audience-opt-in";

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
  writeBoundary: string;
  validation: string[];
};

export const audienceAutomationUpdatedAt = audienceOptInUpdatedAt;

export const audienceAutomationWorkspace: AudienceAutomationWorkspace = {
  id: "audience-automation-workspace-indie-launch",
  slug: "indie-launch-waitlist",
  title: "Indie launch waitlist and nurture preview",
  status: "draft",
  issue: 103,
  parentIssue: 17,
  sourceDataRoute: "/audience/source-data",
  previewRoute: "/audience/indie-launch-waitlist",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  linkedOfferRoute: "/offers/indie-launch-stack",
  linkedProductRoute: "/products/indie-launch-library",
  revisionId: "audience-automation-revision-indie-launch-2026-05-19",
  summary:
    "An audience and automation scaffold with live consent-backed opt-in capture for the seeded waitlist, plus draft lead magnets, tags, sequences, broadcasts, and automation rules before email sends exist.",
  segments: [
    {
      id: "segment-indie-launch-waitlist",
      title: "Indie launch waitlist",
      status: "draft",
      source: "Opt-in form submission after explicit consent",
      definition: "People who request the launch checklist and want follow-up about the sandbox launch offer.",
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
      deliveryPromise: "Send a practical launch checklist after confirmed consent and email verification in a future delivery slice.",
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
          storageBoundary: "Consent records include timestamp, source form, idempotency key, and hashed request evidence; unsubscribe state is future work.",
        },
      ],
      consentStatement:
        "I want the launch checklist and practical follow-up about Bumpgrade. I can unsubscribe later.",
      writeBoundary:
        `This form posts to ${audienceOptInApiRoute}. Email delivery, unsubscribe changes, imports, broadcasts, and CRM notes require future confirmed-write APIs with actor identity, explicit consent, idempotency, audit correlation, redaction, unsubscribe metadata, and spam-safe sending rules.`,
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
          goal: "Fulfill the lead magnet promise without implying a live file delivery path exists today.",
          agentEditable: true,
        },
        {
          id: "email-step-map-funnel",
          subjectIntent: "Show how the funnel, offer, and product records connect",
          timing: "delay_hours",
          delayValue: 24,
          goal: "Educate subscribers with source-linked Bumpgrade surfaces and avoid unsourced customer claims.",
          agentEditable: true,
        },
        {
          id: "email-step-invite-sandbox-offer",
          subjectIntent: "Invite a safe sandbox checkout review",
          timing: "delay_days",
          delayValue: 3,
          goal: "Point to the sandbox offer only after consent and without live-billing claims.",
          agentEditable: true,
        },
      ],
      writeBoundary:
        "Sequence drafts are source-data only. Sending, scheduling, suppression, unsubscribe handling, and contact-specific personalization require future confirmed-write email infrastructure.",
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
        "Broadcast scheduling requires publisher confirmation, preview rendering, suppression-list checks, unsubscribe footer validation, and audit correlation.",
    },
  ],
  writeBoundary:
    "Issue #103 can capture explicit-consent opt-ins, normalize subscriber email, assign seeded tags, and record draft sequence enrollment evidence. Imports, broadcasts, email sends, unsubscribe changes, contact timelines, CRM notes, suppression-list changes, and direct agent writes require actor identity, explicit consent or lawful basis, idempotency, audit correlation, stale-state checks, redaction, suppression-list checks, and sender-domain safety.",
  validation: [
    "/audience/source-data returns seeded audience segments, forms, tags, sequences, automations, and write boundaries.",
    "/audience/indie-launch-waitlist renders the opt-in and nurture preview.",
    "/api/audience/opt-in stores normalized subscriber, consent, tag, and draft sequence enrollment evidence.",
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
  status: "subscriber-capture-ready",
  issue: 103,
  parentIssue: 17,
  generatedFrom: "src/lib/audience-automation.ts",
  routes: [
    "/audience/source-data",
    audienceOptInApiRoute,
    ...audienceAutomationWorkspaces.map((workspace) => workspace.previewRoute),
  ],
  stableIds: [
    "subscriberId",
    "subscriberSegmentId",
    "optInFormId",
    "leadMagnetId",
    "subscriberTagId",
    "emailSequenceId",
    "automationRuleId",
    "broadcastDraftId",
    "consentRecordId",
    "agentActionId",
  ],
  optInWrites: audienceOptInWriteContract,
  writeBoundary: audienceAutomationWorkspace.writeBoundary,
  workspaces: audienceAutomationWorkspaces,
  caveat:
    "This contract proves audience, opt-in, email sequence, automation read/preview semantics, and consent-backed subscriber capture. It does not import contacts, send email, schedule broadcasts, alter unsubscribe state, expose private contact data, or provide direct confirmed-write agent APIs.",
};
