import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, MonitorSmartphone, ShieldCheck, Smartphone } from "lucide-react";

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
            agent contracts used by the web app. This page defines the shared scope before #67 and #68 add app targets.
          </p>
          <Link href="/mobile-admin/source-data" className="text-link">
            Mobile admin source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <MonitorSmartphone aria-hidden="true" />
          <p>Status</p>
          <strong>Contract ready</strong>
          <span>Issue #{mobileAdminContract.parentIssue} splits platform work into iOS issue #67 and Android issue #68.</span>
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
            <h3>Scaffold</h3>
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
            <p>Private mobile views reuse Better Auth owner or publisher sessions after the child slices wire mobile auth.</p>
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
