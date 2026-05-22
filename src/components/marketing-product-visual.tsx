import Image from "next/image";

const productVisuals = [
  {
    src: "/marketing/launch-funnel-card.png",
    alt: "Bumpgrade launch funnel workspace with opt-in, offer, checkout, and delivery steps.",
    label: "Funnel",
  },
  {
    src: "/marketing/checkout-offer-card.png",
    alt: "Bumpgrade checkout offer stack with primary offer, order bump, upsell, and success path.",
    label: "Checkout",
  },
  {
    src: "/marketing/audience-email-card.png",
    alt: "Bumpgrade audience campaign workspace with opt-in, consent, segment, and nurture outline steps.",
    label: "Audience",
  },
];

export function MarketingProductVisual() {
  const [primary, ...supporting] = productVisuals;

  return (
    <div className="marketing-product-visual" aria-label="Bumpgrade product surfaces">
      <div className="product-visual-primary">
        <Image src={primary.src} alt={primary.alt} width={1200} height={650} priority unoptimized />
        <div className="product-visual-overlay">
          <strong>Offer launch workspace</strong>
          <span>Funnel steps, checkout handoff, audience follow-up, and product delivery.</span>
        </div>
      </div>
      <div className="product-visual-rail" aria-label="Related Bumpgrade product views">
        {supporting.map((visual) => (
          <figure key={visual.src}>
            <Image src={visual.src} alt={visual.alt} width={1200} height={650} unoptimized />
            <figcaption>{visual.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
