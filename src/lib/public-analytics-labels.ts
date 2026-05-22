const internalAnalyticsLabelPattern =
  /\b(?:issue|pr|qa|smoke|test|fixture|sandbox|scaffold|implementation)\b|source-data|source data|confirmed-write|read contract|contract shipped|launch-preview/i;

export function publicAnalyticsAttributionLabel(value: string | null | undefined, fallback: string, internalFallback = fallback) {
  const label = value?.trim();
  if (!label) return fallback;
  if (internalAnalyticsLabelPattern.test(label)) return internalFallback;
  return label;
}

export function publicAnalyticsCampaignLabel(parts: Array<string | null>) {
  const labels = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  if (labels.length === 0) return "No campaign label";
  if (labels.some((label) => internalAnalyticsLabelPattern.test(label))) return "Campaign details withheld";
  return labels.join(" / ");
}
