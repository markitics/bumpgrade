import Image from "next/image";
import { ArrowRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

import type { BeforeAfterMarketingVisual as BeforeAfterMarketingVisualContent } from "@/lib/before-after-visuals";

function rowClassName(index: number) {
  return index % 3 === 0 ? "wide" : index % 3 === 1 ? "medium" : "short";
}

export function BeforeAfterVisualPanel({ visual }: { visual: BeforeAfterMarketingVisualContent }) {
  return (
    <div className="before-after-visual" aria-label={visual.title}>
      <div className="before-after-stage">
        <article className="before-after-pane before">
          <div className="before-after-pane-heading">
            <FileText aria-hidden="true" />
            <div>
              <p>{visual.before.eyebrow}</p>
              <h3>{visual.before.title}</h3>
            </div>
          </div>
          <p className="before-after-description">{visual.before.description}</p>
          <ul className="before-after-artifacts" aria-label={`${visual.before.title} public-safe inputs`}>
            {visual.before.artifacts.map((artifact) => (
              <li key={artifact}>
                <span aria-hidden="true" />
                {artifact}
              </li>
            ))}
          </ul>
          <div className="before-after-document" aria-hidden="true">
            <div className="before-after-document-toolbar">
              <span />
              <strong>Redacted source view</strong>
            </div>
            {visual.before.visualRows.map((row, index) => (
              <div key={`${row}-${index}`} className="before-after-document-row">
                <span>{row}</span>
                <i className={rowClassName(index)} />
              </div>
            ))}
          </div>
        </article>

        <div className="before-after-connector" aria-hidden="true">
          <ArrowRight />
          <span>Review map</span>
        </div>

        <article className="before-after-pane after">
          <div className="before-after-pane-heading">
            <LockKeyhole aria-hidden="true" />
            <div>
              <p>{visual.after.eyebrow}</p>
              <h3>{visual.after.title}</h3>
            </div>
          </div>
          <p className="before-after-description">{visual.after.description}</p>
          <div className="before-after-preview-image">
            <Image src={visual.after.image.src} alt={visual.after.image.alt} width={1200} height={650} unoptimized />
          </div>
          <ol className="before-after-review-rail" aria-label={`${visual.after.title} review steps`}>
            {visual.after.visualRows.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <ul className="before-after-artifacts checkpoints" aria-label={`${visual.after.title} checkpoints`}>
            {visual.after.artifacts.map((artifact) => (
              <li key={artifact}>
                <ShieldCheck aria-hidden="true" />
                {artifact}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="before-after-safety" aria-label="Before-after visual safety notes">
        {visual.safetyNotes.map((note) => (
          <span key={note}>{note}</span>
        ))}
      </div>
    </div>
  );
}
