import type { Key, ReactNode } from "react";
import Link from "next/link";

import { marketingDesignTokens, type MarketingBandTone } from "@/lib/marketing-design-tokens";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function MarketingHero({
  eyebrow,
  title,
  lede,
  actions,
  visual,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  className: string;
}) {
  return (
    <section className={className}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {actions ? <MarketingActions>{actions}</MarketingActions> : null}
      </div>
      {visual}
    </section>
  );
}

function MarketingActions({ children }: { children: ReactNode }) {
  return <div className={marketingDesignTokens.layoutClasses.heroActions}>{children}</div>;
}

export function ContentBand({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: MarketingBandTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cx(
        marketingDesignTokens.layoutClasses.contentBand,
        tone === "alternate" && marketingDesignTokens.layoutClasses.alternateBand,
        tone === "dark" && marketingDesignTokens.layoutClasses.darkBand,
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SplitHeading({
  eyebrow,
  title,
  children,
  className = marketingDesignTokens.layoutClasses.splitHeading,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function MarketingCard({
  children,
  className,
  href,
  id,
}: {
  children: ReactNode;
  className: string;
  href?: string;
  id?: string;
}) {
  if (href) {
    return (
      <Link href={href} id={id} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <article id={id} className={className}>
      {children}
    </article>
  );
}

export type ComparisonTableColumn<Row> = {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
};

export function ComparisonTable<Row>({
  columns,
  rows,
  rowKey,
  ariaLabel,
  className,
}: {
  columns: Array<ComparisonTableColumn<Row>>;
  rows: Row[];
  rowKey: (row: Row) => Key;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cx(marketingDesignTokens.tableClasses.table, className)}
      role="table"
      aria-label={ariaLabel}
    >
      <div
        className={`${marketingDesignTokens.tableClasses.row} ${marketingDesignTokens.tableClasses.head}`}
        role="row"
      >
        {columns.map((column) => (
          <div key={column.key} role="columnheader">
            {column.header}
          </div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={rowKey(row)} className={marketingDesignTokens.tableClasses.row} role="row">
          {columns.map((column) => (
            <div key={column.key} role="cell">
              {column.render(row)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
