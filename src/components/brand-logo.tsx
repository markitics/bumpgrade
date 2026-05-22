type BrandMarkProps = {
  className?: string;
  title?: string;
};

export function BrandMark({ className = "brand-mark", title }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <rect x="3" y="3" width="58" height="58" rx="15" fill="#12392d" />
      <path
        d="M18 16h20c8.8 0 14.2 4.5 14.2 11.5 0 4.4-2.3 7.7-6.2 9.4 5.1 1.5 8 5.2 8 10.2C54 55 47.7 59 37.7 59H18V16Z"
        fill="#f8f3e7"
      />
      <path d="M29 25h7.6c3.4 0 5.4 1.7 5.4 4.5S40 34 36.5 34H29v-9Z" fill="#12392d" />
      <path d="M29 43h9.2c3.6 0 5.8 1.8 5.8 4.8S41.8 53 38 53h-9V43Z" fill="#12392d" />
      <path d="M18 16h9v43h-9z" fill="#f8f3e7" />
      <path d="M24 46h9.2l7-7h11.5" fill="none" stroke="#d8a443" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48.5 33.5l3.2 5.5-5.8.8" fill="none" stroke="#d8a443" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandLockup({ className = "brand-lockup" }: { className?: string }) {
  return (
    <span className={className}>
      <BrandMark />
      <span>
        <span className="brand-name">Bumpgrade</span>
        <span className="brand-subtitle">publisher growth OS</span>
      </span>
    </span>
  );
}
