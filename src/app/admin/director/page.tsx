import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Clock3, Database, ListChecks, ShieldAlert } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminSurfaceData } from "@/lib/admin-surface-data";
import { buildDirectorStatusData, type DirectorInitiative, type DirectorStatus, type DirectorWindowChange } from "@/lib/director-status";

export const metadata: Metadata = {
  title: "Director dashboard",
  description: "Executive Bumpgrade status grouped by workstream, recent-change window, risk, and evidence.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: DirectorStatus) {
  if (status === "on_track") return "On track";
  if (status === "at_risk") return "At risk";
  if (status === "blocked") return "Blocked";
  if (status === "done") return "Done";
  return "Quiet";
}

function statusBadgeClass(status: DirectorStatus) {
  if (status === "on_track") return "active";
  if (status === "at_risk") return "pending";
  if (status === "blocked") return "blocked";
  if (status === "done") return "shipped";
  return "idea";
}

function InitiativeList({ title, items, empty }: { title: string; items: DirectorInitiative[]; empty: string }) {
  return (
    <div className="director-initiative-column">
      <h4>{title}</h4>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span className={`status-badge ${item.status === "live" ? "shipped" : item.status === "blocked" ? "blocked" : item.status === "needs_mark" ? "pending" : "active"}`}>
                {item.status.replaceAll("_", " ")}
              </span>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
              <div className="admin-link-list">
                {item.evidence.slice(0, 4).map((link) => (
                  <Link key={`${item.id}-${link.url}-${link.label ?? link.number ?? link.kind}`} href={link.url}>
                    {link.label ?? link.title ?? (link.number ? `#${link.number}` : link.kind ?? "Evidence")}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}

function WindowChangeList({ changes }: { changes: DirectorWindowChange[] }) {
  if (!changes.length) return <p>No named changes in this window.</p>;

  return (
    <ul className="director-window-changes">
      {changes.slice(0, 3).map((change) => (
        <li key={change.id}>
          <strong>{change.title}</strong>
          <span>{change.workstreamTitle}</span>
        </li>
      ))}
    </ul>
  );
}

function ExecutiveQueue({ director }: { director: ReturnType<typeof buildDirectorStatusData> }) {
  return (
    <section className="content-band alternate">
      <div className="roadmap-section-heading">
        <div>
          <p className="eyebrow">Executive queue</p>
          <h2>Due now, in flight, pending next, and watchlist</h2>
        </div>
        <Link href="https://github.com/markitics/bumpgrade/issues/390" className="text-link compact-link">
          Track issue #390
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className="director-queue-grid">
        {director.executiveQueue.map((lane) => (
          <article key={lane.id} className={`director-queue-lane ${lane.id}`}>
            <div className="director-queue-heading">
              <ListChecks aria-hidden="true" />
              <div>
                <p className="eyebrow">{lane.label}</p>
                <strong>{lane.items.length} items</strong>
              </div>
            </div>
            <p>{lane.summary}</p>
            {lane.items.length ? (
              <ul>
                {lane.items.slice(0, 5).map((item) => (
                  <li key={`${lane.id}-${item.workstreamId}-${item.id}`}>
                    <span className={`status-badge ${item.priority === "high" ? "blocked" : item.priority === "medium" ? "active" : "pending"}`}>
                      {item.queueLabel}
                    </span>
                    <strong>{item.title}</strong>
                    <p>{item.workstreamTitle}</p>
                    <div className="admin-link-list">
                      {item.evidence.slice(0, 3).map((link) => (
                        <Link key={`${lane.id}-${item.id}-${link.url}`} href={link.url}>
                          {link.label ?? link.title ?? (link.number ? `#${link.number}` : link.kind ?? "Evidence")}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items in this queue.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function DirectorDashboardPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/director" />;

  const adminData = await getAdminSurfaceData();
  const director = buildDirectorStatusData(adminData);
  const dayWindow = director.windows.find((window) => window.id === "past-1-day");
  const weekWindow = director.windows.find((window) => window.id === "past-7-days");

  return (
    <main className="roadmap-page admin-roadmap-page director-page">
      <section className="roadmap-hero director-hero">
        <div>
          <p className="eyebrow">Director dashboard</p>
          <h1>One screen for what changed, what is due, and what needs Mark.</h1>
          <p className="lede">
            This is the executive layer above the work log. It groups active work by team-like workstream, keeps the
            detailed audit trail one click away, and makes nesting visible without turning every technical slice into
            a new email.
          </p>
          <div className="hero-actions">
            <Link href="/admin/director/source-data" className="primary-action">
              Director JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="https://github.com/markitics/bumpgrade/issues/386" className="secondary-action">
              Track issue #386
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Director dashboard status summary">
          <BriefcaseBusiness aria-hidden="true" />
          <p>{director.source === "fixture" ? "Fixture fallback" : "D1 director brief"}</p>
          <strong>{director.totals.workstreams} workstreams</strong>
          <span>
            {director.loadError ??
              "Work-log, roadmap, journey, and For-Mark records are grouped into director-level status."}
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="director-kpi-strip" aria-label="Director status counts">
          <div>
            <span>Total</span>
            <strong>{director.totals.workstreams}</strong>
            <p>Top-level workstreams</p>
          </div>
          <div>
            <span>On track</span>
            <strong>{director.totals.onTrack}</strong>
            <p>Have active or pending work without visible blockers.</p>
          </div>
          <div>
            <span>At risk</span>
            <strong>{director.totals.atRisk}</strong>
            <p>Need attention, have high churn, or too much active work.</p>
          </div>
          <div>
            <span>Blocked</span>
            <strong>{director.totals.blocked}</strong>
            <p>Have explicit blocked roadmap or attention evidence.</p>
          </div>
          <div>
            <span>Needs Mark</span>
            <strong>{director.totals.needsMark}</strong>
            <p>Open decisions or important non-blocking attention items.</p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Recent change windows</p>
            <h2>What changed in the past day and week</h2>
          </div>
          <Link href="/admin/work-log" className="text-link compact-link">
            Work-log evidence
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="director-window-grid">
          {director.windows.map((window) => (
            <article key={window.id} className="admin-surface-card director-window-card">
              <Clock3 aria-hidden="true" />
              <p className="eyebrow">{window.label}</p>
              <strong>{window.workLogEntries} work-log entries</strong>
              <span>Since {new Date(window.since).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              <div className="admin-meta-grid">
                <div>
                  <strong>{window.changedWorkstreams}</strong>
                  <span>Changed workstreams</span>
                </div>
                <div>
                  <strong>{window.shippedPrs}</strong>
                  <span>Closed PRs in evidence</span>
                </div>
              </div>
              <WindowChangeList changes={window.recentChanges} />
            </article>
          ))}
        </div>
        <div className="director-policy-panel">
          <BarChart3 aria-hidden="true" />
          <div>
            <p className="eyebrow">Email posture</p>
            <h3>Digest-first for niche technical ships.</h3>
            <p>{director.emailPolicy.summary}</p>
          </div>
        </div>
      </section>

      <ExecutiveQueue director={director} />

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Workstream nesting</p>
            <h2>Expand a team-level brief, then drill into issues and evidence</h2>
          </div>
        </div>
        <div className="director-workstream-list">
          {director.workstreams.map((workstream, index) => (
            <details
              key={workstream.id}
              className={`director-workstream ${statusBadgeClass(workstream.status)}`}
              open={index < 3 || workstream.status === "blocked" || workstream.status === "at_risk"}
            >
              <summary>
                <div>
                  <span className={`status-badge ${statusBadgeClass(workstream.status)}`}>{statusLabel(workstream.status)}</span>
                  <h3>{workstream.title}</h3>
                  <p>{workstream.currentFocus}</p>
                </div>
                <dl>
                  <div>
                    <dt>Active</dt>
                    <dd>{workstream.counts.active}</dd>
                  </div>
                  <div>
                    <dt>Pending</dt>
                    <dd>{workstream.counts.pending}</dd>
                  </div>
                  <div>
                    <dt>Changed 7d</dt>
                    <dd>{workstream.counts.changedPastWeek}</dd>
                  </div>
                  <div>
                    <dt>Needs Mark</dt>
                    <dd>{workstream.counts.needsMark}</dd>
                  </div>
                </dl>
              </summary>
              <div className="director-workstream-body">
                <div className="director-owner-note">
                  {workstream.status === "blocked" || workstream.status === "at_risk" ? <ShieldAlert aria-hidden="true" /> : <BriefcaseBusiness aria-hidden="true" />}
                  <div>
                    <p className="eyebrow">{workstream.executiveOwner}</p>
                    <p>{workstream.description}</p>
                  </div>
                </div>
                <div className="director-initiative-grid">
                  <InitiativeList
                    title={weekWindow?.workLogEntries ? "Recently changed" : "Recent changes"}
                    items={workstream.recentlyChanged}
                    empty={dayWindow?.workLogEntries || weekWindow?.workLogEntries ? "No recent changes in this workstream." : "No recent work-log entries in this window."}
                  />
                  <InitiativeList title="In flight" items={workstream.inFlight} empty="No active roadmap record in this workstream." />
                  <InitiativeList title="Pending" items={workstream.pending} empty="No pending roadmap record in this workstream." />
                  <InitiativeList title="Needs Mark" items={workstream.needsMark} empty="No open decision or attention item." />
                  <InitiativeList title="Watchlist" items={workstream.watchlist} empty="No live caveats to monitor." />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
