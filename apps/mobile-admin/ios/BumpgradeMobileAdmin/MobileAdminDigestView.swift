import SwiftUI

struct MobileAdminDigestView: View {
    let contract: MobileAdminContract

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
                    jobsSection
                    safetySection
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 28)
            }
            .background(Color(red: 0.96, green: 0.97, blue: 0.94))
            .navigationTitle("Bumpgrade")
            .navigationBarTitleDisplayMode(.inline)
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
            Text(contract.liveDashboard.route)
                .font(.title3.weight(.bold))
                .foregroundStyle(Color(red: 0.05, green: 0.07, blue: 0.06))
            Text(contract.liveDashboard.purpose)
                .font(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(Color(red: 0.31, green: 0.36, blue: 0.33))
            Detail(label: "Status", value: "\(contract.liveDashboard.status) · issue #\(contract.liveDashboard.issue)")
            Detail(label: "Boundary", value: contract.liveDashboard.redactionBoundary)
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

    private var safetySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Write boundary")
                .font(.caption.weight(.black))
                .textCase(.uppercase)
                .foregroundStyle(Color(red: 0.46, green: 0.38, blue: 0.09))
            Text(contract.confirmedWriteRules.first ?? "The first mobile app slices are read-only.")
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
