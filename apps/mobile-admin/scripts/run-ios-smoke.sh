#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$APP_ROOT/../.." && pwd)"
PROJECT="$APP_ROOT/ios/BumpgradeMobileAdmin.xcodeproj"
SCHEME="BumpgradeMobileAdmin"
SIMULATOR_NAME="${IOS_SIMULATOR_NAME:-iPhone 17}"
DERIVED_DATA="$APP_ROOT/ios/build"
SCREENSHOT_PATH="${IOS_SCREENSHOT_PATH:-$REPO_ROOT/docs/pr-screenshots/issue-67-ios-mobile-admin-simulator.png}"

npm --prefix "$APP_ROOT" run fixture:sync

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -destination "platform=iOS Simulator,name=$SIMULATOR_NAME" \
  -derivedDataPath "$DERIVED_DATA" \
  CODE_SIGNING_ALLOWED=NO \
  build

if ! xcrun simctl list devices booted | grep -q "$SIMULATOR_NAME"; then
  xcrun simctl boot "$SIMULATOR_NAME" || true
fi
xcrun simctl bootstatus booted -b

APP_BUNDLE="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/$SCHEME.app"
xcrun simctl install booted "$APP_BUNDLE"
xcrun simctl launch booted com.bumpgrade.mobileadmin
sleep 5
mkdir -p "$(dirname "$SCREENSHOT_PATH")"
TMP_SCREENSHOT="${TMPDIR:-/tmp}/bumpgrade-ios-mobile-admin-simulator.png"
xcrun simctl io booted screenshot "$TMP_SCREENSHOT"
cp "$TMP_SCREENSHOT" "$SCREENSHOT_PATH"
echo "iOS smoke screenshot saved to $SCREENSHOT_PATH"
