import Foundation

struct MobileAdminContract: Decodable {
    let id: String
    let updatedAt: String
    let publicBaseUrl: String
    let parentIssue: Int
    let status: String
    let featureId: String
    let stackDecision: String
    let scaffoldBoundary: String
    let liveDashboard: MobileLiveDashboard
    let privateAuth: MobilePrivateAuth
    let privateRowsApi: MobilePrivateRowsApi
    let actionIntentApi: MobileActionIntentApi
    let confirmedActions: [MobileConfirmedAction]
    let childIssues: [MobilePlatformSlice]
    let jobs: [MobileJob]
    let apiDependencies: [MobileApiDependency]
    let confirmedWriteRules: [String]

    static func load() -> MobileAdminContract {
        guard let url = Bundle.main.url(forResource: "mobile-admin-contract", withExtension: "json") else {
            fatalError("mobile-admin-contract.json is missing from the app bundle.")
        }

        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(MobileAdminContract.self, from: data)
        } catch {
            fatalError("Could not decode mobile-admin-contract.json: \(error)")
        }
    }
}

struct MobilePrivateAuth: Decodable {
    let id: String
    let issue: Int
    let status: String
    let sessionRoute: String
    let loginRoute: String
    let callbackSurface: String
    let acceptedRoles: [String]
    let sessionSemantics: String
    let deniedStates: [String]
    let platformBehavior: [String]
    let redactionBoundary: String
}

struct MobileConfirmedAction: Decodable, Identifiable {
    let id: String
    let issue: Int
    let title: String
    let status: String
    let surface: String
    let confirmationText: String
    let requiredInputs: [String]
    let safetyRules: [String]
    let mutationBoundary: String
}

struct MobilePrivateRowsApi: Decodable {
    let id: String
    let issue: Int
    let status: String
    let route: String
    let authBoundary: String
    let purpose: String
    let readBoundary: String
    let publicSourceDataSummary: String
    let redactionFlags: [String]
}

struct MobileActionIntentApi: Decodable {
    let id: String
    let issue: Int
    let status: String
    let route: String
    let authBoundary: String
    let purpose: String
    let intentBoundary: String
    let publicSourceDataSummary: String
    let requiredInputs: [String]
    let redactionFlags: [String]
}

struct MobileLiveDashboard: Decodable {
    let id: String
    let issue: Int
    let status: String
    let route: String
    let purpose: String
    let publicSafeReads: [String]
    let redactionBoundary: String
    let renderedInScaffoldsIssue: Int?
    let liveHydrationIssue: Int?
}

struct MobileDashboardSourceData: Decodable {
    let issue: Int
    let status: String
    let route: String
    let redaction: [String: Bool]
    let adminDigest: AdminDigest?

    struct AdminDigest: Decodable {
        let counts: Counts?
    }

    struct Counts: Decodable {
        let roadmapItems: Int?
        let workLogEntries: Int?
        let userJourneys: Int?
        let openAttentionItems: Int?
    }
}

struct MobileDashboardViewModel {
    let route: String
    let purpose: String
    let status: String
    let issue: Int
    let sourceLabel: String
    let boundary: String

    static func fixture(_ dashboard: MobileLiveDashboard) -> MobileDashboardViewModel {
        MobileDashboardViewModel(
            route: dashboard.route,
            purpose: dashboard.purpose,
            status: dashboard.status,
            issue: dashboard.issue,
            sourceLabel: "Fixture fallback",
            boundary: dashboard.redactionBoundary
        )
    }

    static func live(_ payload: MobileDashboardSourceData, fallbackBoundary: String) -> MobileDashboardViewModel {
        let counts = payload.adminDigest?.counts
        let purpose = if let counts {
            "Roadmap \(counts.roadmapItems ?? 0), work logs \(counts.workLogEntries ?? 0), journeys \(counts.userJourneys ?? 0), attention \(counts.openAttentionItems ?? 0)."
        } else {
            "Live public-safe dashboard payload loaded."
        }
        let values = Array(payload.redaction.values)
        let boundary = values.isEmpty || !values.allSatisfy { $0 == false }
            ? fallbackBoundary
            : "Redaction: \(values.count) private-data flags false."

        return MobileDashboardViewModel(
            route: payload.route,
            purpose: purpose,
            status: payload.status,
            issue: payload.issue,
            sourceLabel: "Live network",
            boundary: boundary
        )
    }
}

struct MobilePlatformSlice: Decodable, Identifiable {
    var id: String { platform }

    let platform: String
    let issue: Int
    let title: String
    let firstMilestone: String
    let validation: [String]
    let status: String?
    let appPath: String?
    let sourceDataRoute: String?
    let fixturePath: String?
    let smokeCommand: String?
}

struct MobileJob: Decodable, Identifiable {
    let id: String
    let title: String
    let primaryUser: String
    let goal: String
    let firstScreen: String
    let sourceRoutes: [String]
    let writeBoundary: String
}

struct MobileApiDependency: Decodable, Identifiable {
    let id: String
    let route: String
    let purpose: String
    let authBoundary: String
    let stableIds: [String]
}
