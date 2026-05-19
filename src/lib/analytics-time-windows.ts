export type AnalyticsTimeWindowKey = "all" | "24h" | "7d" | "30d";

export type AnalyticsTimeWindow = {
  key: AnalyticsTimeWindowKey;
  label: string;
  description: string;
  seconds: number | null;
};

export const analyticsTimeWindows: AnalyticsTimeWindow[] = [
  {
    key: "all",
    label: "All time",
    description: "All captured seeded events.",
    seconds: null,
  },
  {
    key: "24h",
    label: "24 hours",
    description: "Captured seeded events from the last 24 hours.",
    seconds: 24 * 60 * 60,
  },
  {
    key: "7d",
    label: "7 days",
    description: "Captured seeded events from the last 7 days.",
    seconds: 7 * 24 * 60 * 60,
  },
  {
    key: "30d",
    label: "30 days",
    description: "Captured seeded events from the last 30 days.",
    seconds: 30 * 24 * 60 * 60,
  },
];

export const defaultAnalyticsTimeWindow = analyticsTimeWindows[0];

export function resolveAnalyticsTimeWindow(value: string | null | undefined) {
  return analyticsTimeWindows.find((window) => window.key === value) ?? defaultAnalyticsTimeWindow;
}

export function analyticsTimeWindowStart(window: AnalyticsTimeWindow, now = Math.floor(Date.now() / 1000)) {
  return window.seconds === null ? null : now - window.seconds;
}
