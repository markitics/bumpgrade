"use client";

import type { AnalyticsTimeWindow, AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AnalyticsTimeWindowSelectorProps = {
  label: string;
  options: AnalyticsTimeWindow[];
  selected: AnalyticsTimeWindowKey;
  onSelect: (window: AnalyticsTimeWindowKey) => void;
};

export function AnalyticsTimeWindowSelector({
  label,
  options,
  selected,
  onSelect,
}: AnalyticsTimeWindowSelectorProps) {
  return (
    <div className="analytics-window-control">
      <span>{label}</span>
      <div className="analytics-window-toggle" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={selected === option.key}
            title={option.description}
            onClick={() => onSelect(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
