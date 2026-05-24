import SwiftUI

struct MobileAdminDigestView: View {
    let contract: MobileAdminContract
    @State private var dashboard: MobileDashboardViewModel

    init(contract: MobileAdminContract) {
        self.contract = contract
        _dashboard = State(initialValue: MobileDashboardViewModel.fixture(contract.liveDashboard))
    }

    private var iosSlice: MobilePlatformSlice? {
        contract.childIssues.first { $0.platform == "ios" }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    contractPanel
                    liveDashboardPanel
                    privateAuthPanel
                    privateRowsPanel
                    privateRowActionsPanel
                    actionIntentPanel
                    jobsSection
                    confirmedActionsSection
                    safetySection
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 28)
            }
            .background(Color(red: 0.96, green: 0.97, blue: 0.94))
            .navigationTitle("Bumpgrade")
            .navigationBarTitleDisplayMode(.inline)
        }
        .task {
            await loadLiveDashboard()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            Badge(text: iosSlice?.status ?? "iOS scaffold")
            Text("Bumpgrade mobile admin")
                .font(.system(size: 38, weight: .black, design: .default))
                .lineSpacing(-1)
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text("The first iOS screen reads the checked-in fixture generated from /mobile-admin/source-data and keeps issue #\(iosSlice?.issue ?? 67) read-only.")
                .font(.system(size: 17, weight: .regular))
                .lineSpacing(4)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
        }
    }

    private var contractPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Source contract")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.id)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text("Parent issue #\(contract.parentIssue). Feature \(contract.featureId).")
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Text(iosSlice?.sourceDataRoute ?? "/mobile-admin/ios/source-data")
                .font(.footnote.weight(.bold))
                .foregroundStyle(Color(red: 0.14, green: 0.27, blue: 0.19))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var liveDashboardPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Live dashboard")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(dashboard.route)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(dashboard.purpose)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Status", value: "\(dashboard.status) · issue #\(dashboard.issue)")
            Detail(label: "Source", value: dashboard.sourceLabel)
            Detail(label: "Boundary", value: dashboard.boundary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var privateAuthPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Private auth")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.privateAuth.status)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(contract.privateAuth.sessionSemantics)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Session", value: contract.privateAuth.sessionRoute)
            Detail(label: "Login", value: "\(contract.privateAuth.loginRoute) -> \(contract.privateAuth.callbackSurface)")
            Detail(label: "Roles", value: contract.privateAuth.acceptedRoles.joined(separator: ", "))
            Detail(label: "Denied", value: contract.privateAuth.deniedStates.joined(separator: ", "))
            Detail(label: "Boundary", value: contract.privateAuth.redactionBoundary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var actionIntentPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Action intent API")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.actionIntentApi.route)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(contract.actionIntentApi.purpose)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Status", value: "\(contract.actionIntentApi.status) · issue #\(contract.actionIntentApi.issue)")
            Detail(label: "Auth", value: contract.actionIntentApi.authBoundary)
            Detail(label: "Boundary", value: contract.actionIntentApi.intentBoundary)
            Detail(label: "Inputs", value: contract.actionIntentApi.requiredInputs.joined(separator: ", "))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var privateRowActionsPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Private row actions API")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.privateRowActionsApi.route)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(contract.privateRowActionsApi.purpose)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Status", value: "\(contract.privateRowActionsApi.status) · issue #\(contract.privateRowActionsApi.issue)")
            Detail(label: "Auth", value: contract.privateRowActionsApi.authBoundary)
            Detail(label: "Boundary", value: contract.privateRowActionsApi.actionBoundary)
            Detail(label: "Inputs", value: contract.privateRowActionsApi.requiredInputs.joined(separator: ", "))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var privateRowsPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Private rows API")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.privateRowsApi.route)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(contract.privateRowsApi.purpose)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Status", value: "\(contract.privateRowsApi.status) · issue #\(contract.privateRowsApi.issue)")
            Detail(label: "Auth", value: contract.privateRowsApi.authBoundary)
            Detail(label: "Boundary", value: contract.privateRowsApi.readBoundary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }

    private var jobsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Phone jobs")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            ForEach(contract.jobs) { job in
                JobCard(job: job)
            }
        }
    }

    private var confirmedActionsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Confirmed mobile actions")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            ForEach(contract.confirmedActions) { action in
                ConfirmedActionCard(action: action)
            }
        }
    }

    private var safetySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Write boundary")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.confirmedWriteRules.first ?? "The first mobile app slices can record audit-only action intents.")
                .font(.body.weight(.semibold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text("Future billing, publishing, moderation, source-editing, and creator-speech actions need the shared confirmed-write API.")
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.08, green: 0.14, blue: 0.10).opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    @MainActor
    private func loadLiveDashboard() async {
        guard let url = URL(string: "\(contract.publicBaseUrl)\(contract.liveDashboard.route)") else {
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
                return
            }
            let payload = try JSONDecoder().decode(MobileDashboardSourceData.self, from: data)
            dashboard = MobileDashboardViewModel.live(payload, fallbackBoundary: contract.liveDashboard.redactionBoundary)
        } catch {
            dashboard = MobileDashboardViewModel.fixture(contract.liveDashboard)
        }
    }
}

struct ConfirmedActionCard: View {
    let action: MobileConfirmedAction

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Badge(text: action.status)
            Text(action.title)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(action.mutationBoundary)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Surface", value: action.surface)
            Detail(label: "Confirmation", value: action.confirmationText)
            Detail(label: "Inputs", value: action.requiredInputs.joined(separator: ", "))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }
}

struct JobCard: View {
    let job: MobileJob

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Badge(text: job.firstScreen)
            Text(job.title)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(job.goal)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "User", value: job.primaryUser)
            Detail(label: "Routes", value: job.sourceRoutes.joined(separator: ", "))
            Detail(label: "Boundary", value: job.writeBoundary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color(red: 0.85, green: 0.87, blue: 0.84), lineWidth: 1)
        )
    }
}

struct Detail: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(value)
                .font(.footnote.weight(.semibold))
                .lineSpacing(2)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
        }
    }
}

struct Badge: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption2.weight(.black))
            .textCase(.uppercase)
            .foregroundStyle(Color(red: 0.14, green: 0.27, blue: 0.19))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color(red: 0.91, green: 0.94, blue: 0.90))
            .clipShape(Capsule())
    }
}
