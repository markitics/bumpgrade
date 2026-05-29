export type BeforeAfterVisualColumn = {
  eyebrow: string;
  title: string;
  description: string;
  artifacts: string[];
  visualRows: string[];
};

export type BeforeAfterVisualImage = {
  src: string;
  alt: string;
};

export type BeforeAfterMarketingVisual = {
  id: string;
  issue: number;
  title: string;
  summary: string;
  before: BeforeAfterVisualColumn;
  after: BeforeAfterVisualColumn & {
    image: BeforeAfterVisualImage;
  };
  safetyNotes: string[];
};

export const beforeAfterVisualSafetyNotes = [
  "Uses public-safe labels, structure, counts, and review states only.",
  "Does not display raw export rows, pasted source copy, credentials, payment data, private subscriber values, or customer identifiers.",
  "Shows Bumpgrade private plan, review, and protected path structure without claiming live transfer or buyer-facing changes.",
];
