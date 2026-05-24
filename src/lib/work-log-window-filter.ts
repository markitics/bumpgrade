import type { AdminWorkLogEntry } from "@/lib/admin-surface-data";
import type { DirectorWindow, DirectorWindowId } from "@/lib/director-status";

export type WorkLogWindowFilterId = "all" | DirectorWindowId;

export const workLogWindowFilterOptions: {
  id: WorkLogWindowFilterId;
  label: string;
  heading: string;
}[] = [
  { id: "all", label: "All", heading: "All recorded work and validation" },
  { id: "past-1-day", label: "Past 1 day", heading: "Past-day work and validation" },
  { id: "past-7-days", label: "Past 7 days", heading: "Past-week work and validation" },
];

export function normalizeWorkLogWindowFilter(value: string | string[] | undefined): WorkLogWindowFilterId {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return workLogWindowFilterOptions.some((option) => option.id === rawValue)
    ? (rawValue as WorkLogWindowFilterId)
    : "all";
}

export function filterWorkLogEntriesForWindow(
  entries: AdminWorkLogEntry[],
  windows: DirectorWindow[],
  filterId: WorkLogWindowFilterId,
) {
  if (filterId === "all") return entries;
  const window = windows.find((item) => item.id === filterId);
  const cutoff = window ? Date.parse(window.since) : NaN;
  if (!Number.isFinite(cutoff)) return entries;
  return entries.filter((entry) => {
    const completedAt = Date.parse(entry.completedAt);
    return Number.isFinite(completedAt) && completedAt >= cutoff;
  });
}
