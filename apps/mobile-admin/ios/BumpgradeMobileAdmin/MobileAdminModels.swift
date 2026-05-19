import Foundation

struct MobileAdminContract: Decodable {
    let id: String
    let updatedAt: String
    let parentIssue: Int
    let status: String
    let featureId: String
    let stackDecision: String
    let scaffoldBoundary: String
    let liveDashboard: MobileLiveDashboard
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

struct MobileLiveDashboard: Decodable {
    let id: String
    let issue: Int
    let status: String
    let route: String
    let purpose: String
    let publicSafeReads: [String]
    let redactionBoundary: String
    let renderedInScaffoldsIssue: Int?
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
