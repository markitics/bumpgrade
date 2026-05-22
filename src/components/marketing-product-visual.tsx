import Image from "next/image";

const productVisuals = [
  {
    src: "/pr-screenshots/issue-249-funnel-example.png",
    alt: "Bumpgrade funnel example with ordered launch steps and page blocks.",
    label: "Funnel",
  },
  {
    src: "/pr-screenshots/issue-249-offer-stack.png",
    alt: "Bumpgrade offer stack showing checkout and order bump structure.",
    label: "Checkout",
  },
  {
    src: "/pr-screenshots/issue-249-audience-automation.png",
    alt: "Bumpgrade audience automation view with waitlist and readiness records.",
    label: "Audience",
  },
];

export function MarketingProductVisual() {
  const [primary, ...supporting] = productVisuals;

  return (
    <div className="marketing-product-visual" aria-label="Bumpgrade product surfaces">
      <div className="product-visual-primary">
        <Image src={primary.src} alt={primary.alt} width={1440} height={4596} priority unoptimized />
        <div className="product-visual-overlay">
          <strong>Offer launch workspace</strong>
          <span>Funnel steps, checkout handoff, audience follow-up, and product evidence.</span>
        </div>
      </div>
      <div className="product-visual-rail" aria-label="Related Bumpgrade product views">
        {supporting.map((visual) => (
          <figure key={visual.src}>
            <Image src={visual.src} alt={visual.alt} width={1440} height={3600} unoptimized />
            <figcaption>{visual.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
