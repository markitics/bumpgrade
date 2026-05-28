"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { BarChart3, Bot, CheckCircle2, Mail, PanelsTopLeft, ShoppingCart } from "lucide-react";

const demoSteps = [
  {
    id: "funnel",
    label: "Funnel",
    title: "Map the path",
    detail: "Opt-in, offer, checkout handoff, and thank-you steps stay in one launch path.",
    image: "/marketing/launch-funnel-card.png",
    imageAlt: "Bumpgrade launch funnel workspace with opt-in, offer, checkout, and delivery steps.",
    icon: PanelsTopLeft,
    proof: ["Opt-in", "Offer", "Thank-you"],
    status: "Path connected",
  },
  {
    id: "checkout",
    label: "Checkout",
    title: "Shape the offer",
    detail: "Primary offer, order bump, upsell, and downsell decisions stay attached to the funnel.",
    image: "/marketing/checkout-offer-card.png",
    imageAlt: "Bumpgrade checkout offer stack with primary offer, order bump, upsell, and success path.",
    icon: ShoppingCart,
    proof: ["Offer stack", "Order bump", "Access rule"],
    status: "Offer ready",
  },
  {
    id: "audience",
    label: "Audience and email",
    title: "Follow up cleanly",
    detail: "Consent, welcome email, delivery notes, and nurture steps travel with the launch.",
    image: "/marketing/audience-email-card.png",
    imageAlt: "Bumpgrade audience campaign workspace with opt-in, consent, segment, and nurture outline steps.",
    icon: Mail,
    proof: ["Consent", "Welcome", "Delivery"],
    status: "Message path set",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "Read the launch",
    detail: "Source attribution, conversion view, and experiment notes show what moved buyers.",
    image: "/marketing/analytics-card.png",
    imageAlt: "Bumpgrade analytics workspace with campaign attribution, conversion movement, and experiment notes.",
    icon: BarChart3,
    proof: ["Attribution", "Conversion", "Experiment"],
    status: "Learning loop on",
  },
  {
    id: "ai",
    label: "AI help",
    title: "Choose the next move",
    detail: "AI help reads the connected workflow and suggests the next launch task with evidence nearby.",
    image: "/marketing/ai-launch-advisor-workspace.png",
    imageAlt: "Bumpgrade AI launch advisor workspace summarizing next steps from funnel, checkout, audience, and analytics context.",
    icon: Bot,
    proof: ["Context", "Evidence", "Next task"],
    status: "Guidance ready",
  },
];

export function HomepageDemoLoop() {
  const idPrefix = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentHidden(document.hidden);

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || isDocumentHidden) return;

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % demoSteps.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [isDocumentHidden, isPaused, prefersReducedMotion]);

  const selectTab = useCallback((nextIndex: number, shouldFocus = false) => {
    setActiveIndex(nextIndex);

    if (shouldFocus) {
      tabRefs.current[nextIndex]?.focus();
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = demoSteps.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    selectTab(nextIndex, true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;

    setIsPaused(false);
  };

  return (
    <section
      className="homepage-demo-loop"
      aria-label="Connected launch workflow demo"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="homepage-demo-toolbar">
        <span>Launch walkthrough</span>
        <strong>{demoSteps[activeIndex]?.status}</strong>
      </div>
      <div className="homepage-demo-grid">
        <div className="homepage-demo-tabs" role="tablist" aria-label="Launch workflow steps">
          {demoSteps.map((step, index) => {
            const Icon = step.icon;
            const isSelected = activeIndex === index;
            const tabId = `${idPrefix}-${step.id}-tab`;
            const panelId = `${idPrefix}-${step.id}-panel`;

            return (
              <button
                key={step.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabId}
                className="homepage-demo-tab"
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <Icon aria-hidden="true" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        <div className="homepage-demo-panels">
          {demoSteps.map((step, index) => {
            const isSelected = activeIndex === index;
            const tabId = `${idPrefix}-${step.id}-tab`;
            const panelId = `${idPrefix}-${step.id}-panel`;

            return (
              <article
                key={step.id}
                id={panelId}
                className="homepage-demo-panel"
                role="tabpanel"
                aria-labelledby={tabId}
                aria-hidden={!isSelected}
                tabIndex={isSelected ? 0 : -1}
                data-active={isSelected}
              >
                <div className="homepage-demo-image-frame">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={1200}
                    height={650}
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                    sizes="(max-width: 700px) 100vw, 520px"
                    unoptimized
                  />
                </div>
                <div className="homepage-demo-copy">
                  <span>{step.label}</span>
                  <h2>{step.title}</h2>
                  <p>{step.detail}</p>
                  <ul aria-label={`${step.label} connected items`}>
                    {step.proof.map((item) => (
                      <li key={item}>
                        <CheckCircle2 aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
