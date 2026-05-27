export type AnalyticsExperimentWinnerRolloutAssignment = {
  id: string;
  selectedVariantId: string;
};

type WinnerRolloutAssignmentRow = {
  id: string;
  selected_variant_id: string;
};

export async function loadActiveExperimentWinnerRolloutForAssignment(
  db: D1Database,
  experimentId: string,
  sourceRoute: string,
): Promise<AnalyticsExperimentWinnerRolloutAssignment | null> {
  try {
    const row = await db
      .prepare(
        `SELECT id, selected_variant_id
         FROM analytics_experiment_winner_rollouts
         WHERE experiment_id = ?
           AND source_route = ?
           AND rollout_status = 'active'
           AND traffic_routing_enabled = 1
           AND automated_winner_enabled = 1
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .bind(experimentId, sourceRoute)
      .first<WinnerRolloutAssignmentRow>();
    if (!row) return null;
    return { id: row.id, selectedVariantId: row.selected_variant_id };
  } catch {
    return null;
  }
}
