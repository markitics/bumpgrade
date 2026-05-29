export const customerProofSourceDataRoute = "/trust/source-data";

export const customerProofUpdatedAt = "2026-05-29";

export type CustomerProofKind = "testimonial" | "logo" | "case-study" | "metric" | "press-mention";
export type CustomerProofReviewStatus = "approved" | "pending_approval" | "withdrawn";
export type CustomerProofPlacement =
  | "homepage"
  | "features"
  | "feature-detail"
  | "pricing"
  | "compare"
  | "compare-detail"
  | "users";

export type CustomerProofSource = {
  id: string;
  label: string;
  url: string;
  retrievedAt: string;
  confidence: "high" | "medium";
  notes: string[];
};

export type CustomerProofMetric = {
  label: string;
  value: string;
  period: string;
};

export type CustomerProofReview = {
  status: CustomerProofReviewStatus;
  reviewedAt: string | null;
  approvalEvidenceUrl: string | null;
  publicConsent: "explicit" | "implicit_public_post" | "none";
};

export type CustomerProofRecord = {
  id: string;
  kind: CustomerProofKind;
  headline: string;
  customerDisplayName: string | null;
  customerRole: string | null;
  customerOrg: string | null;
  quote: string | null;
  metric: CustomerProofMetric | null;
  caseStudyRoute: string | null;
  logoAssetPath: string | null;
  linkedFeatureIds: string[];
  linkedCompetitorIds: string[];
  audienceSegmentIds: string[];
  placements: CustomerProofPlacement[];
  source: CustomerProofSource;
  review: CustomerProofReview;
  privateFieldsExcluded: string[];
};

export type CustomerProofFilter = {
  placement?: CustomerProofPlacement;
  linkedFeatureIds?: string[];
  linkedCompetitorId?: string;
  audienceSegmentId?: string;
};

export const customerProofPolicy = {
  id: "customer-proof-approval-policy",
  issueNumber: 553,
  summary:
    "Bumpgrade does not publish customer names, logos, quotes, metrics, case studies, or endorsements until a proof record has public source evidence and owner approval.",
  approver: "owner-approved issue or PR evidence",
  sourceDataRoute: customerProofSourceDataRoute,
  emptyState:
    "No customer testimonials, customer logos, customer metrics, or named case studies are approved for public rendering yet.",
  disallowedWithoutApprovedProof: [
    "trusted by",
    "join thousands",
    "hundreds of customers",
    "customer revenue",
    "customer quote",
    "customer logo",
    "case study",
  ],
  requiredApprovalFields: ["review.status", "review.approvalEvidenceUrl", "source.url", "source.retrievedAt"],
  publicRedactionBoundary: [
    "private contact details",
    "raw emails or DMs",
    "unapproved customer names",
    "unapproved logos",
    "unapproved revenue or conversion metrics",
    "private implementation notes",
  ],
} as const;

export const customerProofEmptyState = {
  eyebrow: "Customer proof policy",
  headline: "Customer names, logos, quotes, and metrics stay unpublished until approved.",
  body:
    "Bumpgrade public pages currently cite product source data, comparison records, route proof, and issue evidence. Approved customer proof will appear only after a source-backed record includes public consent and owner approval.",
  linkLabel: "View proof records",
  linkHref: customerProofSourceDataRoute,
} as const;

export const customerProofRecords: CustomerProofRecord[] = [];

function hasMatchingFilter(record: CustomerProofRecord, filter: CustomerProofFilter) {
  if (filter.placement && !record.placements.includes(filter.placement)) return false;
  if (filter.linkedCompetitorId && !record.linkedCompetitorIds.includes(filter.linkedCompetitorId)) return false;
  if (filter.audienceSegmentId && !record.audienceSegmentIds.includes(filter.audienceSegmentId)) return false;
  if (
    filter.linkedFeatureIds?.length &&
    !filter.linkedFeatureIds.some((featureId) => record.linkedFeatureIds.includes(featureId))
  ) {
    return false;
  }
  return true;
}

export function getApprovedCustomerProofRecords(filter: CustomerProofFilter = {}) {
  return customerProofRecords.filter((record) => record.review.status === "approved" && hasMatchingFilter(record, filter));
}

export function validateCustomerProofRecord(record: CustomerProofRecord) {
  const errors: string[] = [];

  if (!record.id.startsWith("customer-proof-")) {
    errors.push("id must start with customer-proof-");
  }

  if (!record.source.url.startsWith("https://")) {
    errors.push(`${record.id} source.url must be an https URL`);
  }

  if (record.review.status === "approved") {
    if (!record.review.approvalEvidenceUrl?.startsWith("https://")) {
      errors.push(`${record.id} approved records require an https approvalEvidenceUrl`);
    }
    if (record.review.publicConsent === "none") {
      errors.push(`${record.id} approved records require public consent`);
    }
  }

  if (record.kind === "testimonial" && record.review.status === "approved" && !record.quote) {
    errors.push(`${record.id} approved testimonials require a quote`);
  }

  if (record.kind === "metric" && record.review.status === "approved" && !record.metric) {
    errors.push(`${record.id} approved metrics require a metric object`);
  }

  if (record.kind === "logo" && record.review.status === "approved" && !record.logoAssetPath) {
    errors.push(`${record.id} approved logos require a logoAssetPath`);
  }

  return errors;
}

export function assertCustomerProofRegistryIntegrity(records = customerProofRecords) {
  const errors = records.flatMap(validateCustomerProofRecord);
  if (errors.length) {
    throw new Error(`Customer proof registry is invalid:\n${errors.join("\n")}`);
  }
}

function statusCounts(records: CustomerProofRecord[]) {
  return records.reduce(
    (counts, record) => {
      counts[record.review.status] += 1;
      return counts;
    },
    {
      approved: 0,
      pending_approval: 0,
      withdrawn: 0,
    },
  );
}

function kindCounts(records: CustomerProofRecord[]) {
  return records.reduce(
    (counts, record) => {
      counts[record.kind] += 1;
      return counts;
    },
    {
      testimonial: 0,
      logo: 0,
      "case-study": 0,
      metric: 0,
      "press-mention": 0,
    },
  );
}

export function toPublicCustomerProofRecord(record: CustomerProofRecord) {
  return {
    id: record.id,
    kind: record.kind,
    headline: record.headline,
    customerDisplayName: record.review.status === "approved" ? record.customerDisplayName : null,
    customerRole: record.review.status === "approved" ? record.customerRole : null,
    customerOrg: record.review.status === "approved" ? record.customerOrg : null,
    quote: record.review.status === "approved" ? record.quote : null,
    metric: record.review.status === "approved" ? record.metric : null,
    caseStudyRoute: record.review.status === "approved" ? record.caseStudyRoute : null,
    logoAssetPath: record.review.status === "approved" ? record.logoAssetPath : null,
    linkedFeatureIds: record.linkedFeatureIds,
    linkedCompetitorIds: record.linkedCompetitorIds,
    audienceSegmentIds: record.audienceSegmentIds,
    placements: record.placements,
    source: record.source,
    review: record.review,
    privateFieldsExcluded: record.privateFieldsExcluded,
  };
}

export const customerProofSourceData = {
  id: "bumpgrade-customer-proof-source-data",
  updatedAt: customerProofUpdatedAt,
  generatedFrom: ["src/lib/customer-proof.ts"],
  issueNumber: 553,
  sourceDataRoute: customerProofSourceDataRoute,
  caveat:
    "This registry is the only public customer-proof source. Agents and pages must not invent customer names, logos, quotes, metrics, endorsements, case studies, or revenue claims outside approved records.",
  policy: customerProofPolicy,
  emptyState: customerProofEmptyState,
  summary: {
    totalRecords: customerProofRecords.length,
    approvedRecords: customerProofRecords.filter((record) => record.review.status === "approved").length,
    renderedCustomerProofRecords: getApprovedCustomerProofRecords().length,
    statusCounts: statusCounts(customerProofRecords),
    kindCounts: kindCounts(customerProofRecords),
  },
  records: customerProofRecords.map(toPublicCustomerProofRecord),
};
