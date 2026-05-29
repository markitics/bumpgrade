import Link from "next/link";
import { BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";

import {
  customerProofEmptyState,
  getApprovedCustomerProofRecords,
  type CustomerProofPlacement,
} from "@/lib/customer-proof";

type CustomerProofPanelProps = {
  placement: CustomerProofPlacement;
  linkedFeatureIds?: string[];
  linkedCompetitorId?: string;
  audienceSegmentId?: string;
  className?: string;
};

function recordSourceLabel(kind: string) {
  if (kind === "metric") return "Metric source";
  if (kind === "logo") return "Logo approval";
  if (kind === "case-study") return "Case study";
  if (kind === "press-mention") return "Press source";
  return "Quote source";
}

export function CustomerProofPanel({
  placement,
  linkedFeatureIds,
  linkedCompetitorId,
  audienceSegmentId,
  className,
}: CustomerProofPanelProps) {
  const records = getApprovedCustomerProofRecords({
    placement,
    linkedFeatureIds,
    linkedCompetitorId,
    audienceSegmentId,
  });
  const classes = ["customer-proof-panel", className].filter(Boolean).join(" ");

  if (!records.length) {
    return (
      <div className={classes} data-customer-proof-state="empty">
        <div className="customer-proof-copy">
          <ShieldCheck aria-hidden="true" />
          <p className="eyebrow">{customerProofEmptyState.eyebrow}</p>
          <h3>{customerProofEmptyState.headline}</h3>
          <p>{customerProofEmptyState.body}</p>
        </div>
        <div className="customer-proof-policy">
          <span>Approved proof records</span>
          <strong>0</strong>
          <p>No testimonial, logo, case-study, or metric is rendered without source evidence and owner approval.</p>
          <Link href={customerProofEmptyState.linkHref} className="text-link compact-link">
            {customerProofEmptyState.linkLabel}
            <ExternalLink aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} data-customer-proof-state="approved">
      {records.map((record) => (
        <article key={record.id} className="customer-proof-card">
          <div className="customer-proof-card-top">
            <span className="status-badge live">Approved</span>
            <span>{record.kind}</span>
          </div>
          <h3>{record.headline}</h3>
          {record.quote ? <blockquote>{record.quote}</blockquote> : null}
          {record.metric ? (
            <p>
              <strong>{record.metric.value}</strong> {record.metric.label} during {record.metric.period}
            </p>
          ) : null}
          {record.customerDisplayName ? (
            <p className="customer-proof-attribution">
              {record.customerDisplayName}
              {record.customerOrg ? `, ${record.customerOrg}` : ""}
            </p>
          ) : null}
          <a href={record.source.url} className="text-link compact-link">
            {recordSourceLabel(record.kind)}
            <BadgeCheck aria-hidden="true" />
          </a>
        </article>
      ))}
    </div>
  );
}
