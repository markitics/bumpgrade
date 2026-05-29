import {
  adminRoadmapCounts,
  getAdminSurfaceData,
  summarizeUserJourneyProof,
  toPublicAdminSurfaceData,
  toPublicAdminWorkLogEntry,
} from "@/lib/admin-surface-data";
import { buildDirectorStatusData } from "@/lib/director-status";

export async function getProjectSourceDataPayload() {
  const data = toPublicAdminSurfaceData(await getAdminSurfaceData());

  return {
    id: "bumpgrade-admin-source-data",
    caveat:
      "Admin source data is public-safe until Better Auth protection ships. Do not store private notes, secrets, private user data, or raw provider identifiers here.",
    ...data,
  };
}

export async function getDirectorStatusSourceDataPayload() {
  return buildDirectorStatusData(await getAdminSurfaceData());
}

export async function getProjectRoadmapSourceDataPayload() {
  const data = await getAdminSurfaceData();

  return {
    id: "bumpgrade-admin-roadmap-source-data",
    source: data.source,
    loadError: data.loadError,
    counts: adminRoadmapCounts(data.roadmapItems),
    records: data.roadmapItems,
  };
}

export async function getProjectWorkLogSourceDataPayload() {
  const data = await getAdminSurfaceData();

  return {
    id: "bumpgrade-admin-work-log-source-data",
    source: data.source,
    loadError: data.loadError,
    entries: data.workLogEntries.map(toPublicAdminWorkLogEntry),
  };
}

export async function getUserJourneySourceDataPayload() {
  const data = await getAdminSurfaceData();
  const proofSummary = summarizeUserJourneyProof(data.userJourneys);

  return {
    id: "bumpgrade-admin-user-journeys-source-data",
    source: data.source,
    loadError: data.loadError,
    proofSummary,
    journeys: data.userJourneys,
  };
}

export async function getOwnerAttentionSourceDataPayload() {
  const data = await getAdminSurfaceData();

  return {
    id: "bumpgrade-admin-for-mark-source-data",
    source: data.source,
    loadError: data.loadError,
    attentionItems: data.attentionItems,
  };
}
