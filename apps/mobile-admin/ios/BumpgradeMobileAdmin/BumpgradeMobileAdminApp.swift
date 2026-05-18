import SwiftUI

@main
struct BumpgradeMobileAdminApp: App {
    var body: some Scene {
        WindowGroup {
            MobileAdminDigestView(contract: MobileAdminContract.load())
        }
    }
}
