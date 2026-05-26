import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, MonitorSmartphone, ShieldCheck, Smartphone } from "lucide-react";

import { androidMobileAdminSourceData } from "@/lib/mobile-admin-android";
import { iosMobileAdminSourceData } from "@/lib/mobile-admin-ios";
import { mobileAdminContract } from "@/lib/mobile-admin";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade mobile admin contract",
  description:
    "Shared iOS and Android publisher admin app contract, mobile jobs-to-be-done, API dependencies, authentication boundaries, and confirmed-write rules.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-mobile-admin`,
  },
};

export default function MobileAdminAgentDocPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Mobile admin starts with one contract for iOS and Android.</h1>
          <p className="lede">
            Bumpgrade will build native publisher/admin apps from the same feature, roadmap, commerce, admin, and
            agent contracts used by the web app. This page defines the shared scope and the first platform smoke
            paths for #67 and #68 plus the issue #414 owner-session, private-row, private-row action,
            Director review, commerce review, action-intent, Director digest, confirmed-action, push-readiness, and distribution-readiness contract.
          </p>
          <Link href="/mobile-admin/source-data" className="text-link">
            Mobile admin source data
            <Database aria-hidden="true" />
          </Link>
          <Link href={mobileAdminContract.liveDashboard.route} className="text-link">
            Live mobile dashboard source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <MonitorSmartphone aria-hidden="true" />
          <p>Status</p>
          <strong>Contract ready</strong>
          <span>
            Issue #{mobileAdminContract.parentIssue} splits platform work into iOS issue #67, Android issue #68, and
            dashboard issue #{mobileAdminContract.liveDashboard.issue}.
          </span>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Private auth and actions</p>
            <h2>Mobile uses the same owner-session and confirmation rules.</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/414" className="text-link compact-link">
            Track issue #414
            <ShieldCheck aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <KeyRound aria-hidden="true" />
            <h3>{mobileAdminContract.privateAuth.status}</h3>
            <p>{mobileAdminContract.privateAuth.sessionSemantics}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>{mobileAdminContract.privateRowsApi.status}</h3>
            <p>{mobileAdminContract.privateRowsApi.readBoundary}</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{mobileAdminContract.privateRowActionsApi.status}</h3>
            <p>{mobileAdminContract.privateRowActionsApi.actionBoundary}</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{mobileAdminContract.directorReviewApi.status}</h3>
            <p>{mobileAdminContract.directorReviewApi.reviewBoundary}</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{mobileAdminContract.commerceReviewApi.status}</h3>
            <p>{mobileAdminContract.commerceReviewApi.reviewBoundary}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>{mobileAdminContract.actionIntentApi.status}</h3>
            <p>{mobileAdminContract.actionIntentApi.intentBoundary}</p>
          </div>
          {mobileAdminContract.confirmedActions.map((action) => (
            <div key={action.id}>
              <ShieldCheck aria-hidden="true" />
              <h3>{action.title}</h3>
              <p>{action.mutationBoundary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Push and distribution</p>
            <h2>Readiness is explicit, but sends and store distribution are not live.</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/414" className="text-link compact-link">
            Track issue #414
            <ShieldCheck aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{mobileAdminContract.pushNotificationBoundary.status}</h3>
            <p>{mobileAdminContract.pushNotificationBoundary.publicSourceDataSummary}</p>
          </div>
          <div>
            <MonitorSmartphone aria-hidden="true" />
            <h3>{mobileAdminContract.distributionReadiness.status}</h3>
            <p>{mobileAdminContract.distributionReadiness.publicSourceDataSummary}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Disabled until evidence exists</h3>
            <p>
              {mobileAdminContract.pushNotificationBoundary.sendCapability}; installable distribution claim{" "}
              {mobileAdminContract.distributionReadiness.installableDistributionClaim ? "live" : "not live"}.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Live dashboard</p>
            <h2>One public-safe digest for mobile clients.</h2>
          </div>
          <Link href={mobileAdminContract.liveDashboard.route} className="text-link compact-link">
            Dashboard source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Route</h3>
            <p>{mobileAdminContract.liveDashboard.route} gives iOS, Android, web, and agents one dashboard payload.</p>
          </div>
          <div>
            <MonitorSmartphone aria-hidden="true" />
            <h3>Status</h3>
            <p>{mobileAdminContract.liveDashboard.status} from issue #{mobileAdminContract.liveDashboard.issue}.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Redaction</h3>
            <p>{mobileAdminContract.liveDashboard.redactionBoundary}</p>
          </div>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Director brief</p>
            <h2>The phone view can start with workstreams instead of nested noise.</h2>
          </div>
          <Link href="/admin/director/source-data" className="text-link compact-link">
            Director source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Source</h3>
            <p>
              The mobile dashboard carries a redacted directorDigest sourced from /admin/director/source-data.
            </p>
          </div>
          <div>
            <MonitorSmartphone aria-hidden="true" />
            <h3>Shape</h3>
            <p>
              Mobile clients can show workstream totals, 1-day/7-day changes, executive queue counts, and compact
              brief signals for categories such as Marketing, Mobile Admin, and Security / Trust.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Redaction</h3>
            <p>
              The digest excludes raw attention bodies, raw work-log bodies, private rows, owner email values, and
              private evidence.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Jobs</p>
            <h2>What publishers need on a phone</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/13" className="text-link compact-link">
            Track issue #13
            <Smartphone aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {mobileAdminContract.jobs.map((job) => (
            <article key={job.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Job</span>
                <span>{job.firstScreen}</span>
              </div>
              <h3>{job.title}</h3>
              <p>{job.goal}</p>
              <div className="feature-detail">
                <strong>User</strong>
                <span>{job.primaryUser}</span>
              </div>
              <div className="feature-detail">
                <strong>Source routes</strong>
                <span>{job.sourceRoutes.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Boundary</strong>
                <span>{job.writeBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Platform split</p>
            <h2>Each app gets its own issue and smoke path.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {mobileAdminContract.childIssues.map((slice) => (
            <article key={slice.platform} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge pending">{slice.platform}</span>
                <Link href={`https://github.com/markitics/bumpgrade/issues/${slice.issue}`}>Issue #{slice.issue}</Link>
              </div>
              <h3>{slice.title}</h3>
              <p>{slice.firstMilestone}</p>
              {slice.status ? (
                <div className="feature-detail">
                  <strong>Status</strong>
                  <span>{slice.status}</span>
                </div>
              ) : null}
              <div className="feature-detail">
                <strong>Validation</strong>
                <span>{slice.validation.join(" ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">iOS slice</p>
            <h2>The first simulator path is source-data backed.</h2>
          </div>
          <Link href={iosMobileAdminSourceData.sourceDataRoute} className="text-link compact-link">
            iOS source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Smartphone aria-hidden="true" />
            <h3>App foundation</h3>
            <p>{iosMobileAdminSourceData.appPath} contains the Expo entrypoint and iOS smoke target.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Fixture</h3>
            <p>{iosMobileAdminSourceData.fixturePath} is generated from /mobile-admin/source-data before the iOS app renders.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Smoke</h3>
            <p>{iosMobileAdminSourceData.smokeCommand} builds, launches, and screenshots the simulator target.</p>
          </div>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Android slice</p>
            <h2>The first emulator path is source-data backed.</h2>
          </div>
          <Link href={androidMobileAdminSourceData.sourceDataRoute} className="text-link compact-link">
            Android source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Smartphone aria-hidden="true" />
            <h3>App foundation</h3>
            <p>{androidMobileAdminSourceData.nativeProjectPath} contains the native Android smoke target.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Fixture</h3>
            <p>{androidMobileAdminSourceData.androidAssetPath} is generated from /mobile-admin/source-data before the Android app renders.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Smoke</h3>
            <p>{androidMobileAdminSourceData.smokeCommand} builds, launches, and screenshots the emulator target.</p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">API dependencies</p>
            <h2>Mobile reuses web and admin contracts.</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {mobileAdminContract.apiDependencies.map((dependency) => (
            <article key={dependency.id} className="feature-card">
              <div className="feature-card-top">
                <span className={`status-badge ${dependency.authBoundary === "public-safe" ? "live" : "pending"}`}>
                  {dependency.authBoundary}
                </span>
                <span>{dependency.route}</span>
              </div>
              <h3>{dependency.id}</h3>
              <p>{dependency.purpose}</p>
              <div className="feature-detail">
                <strong>Stable IDs</strong>
                <span>{dependency.stableIds.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Stack and safety</p>
            <h2>No mobile-only product semantics.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Smartphone aria-hidden="true" />
            <h3>Native direction</h3>
            <p>{mobileAdminContract.stackDecision}</p>
          </div>
          <div>
            <KeyRound aria-hidden="true" />
            <h3>Auth boundary</h3>
            <p>{mobileAdminContract.privateAuth.redactionBoundary}</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes</h3>
            <p>{mobileAdminContract.confirmedWriteRules[0]} {mobileAdminContract.confirmedWriteRules[2]}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
