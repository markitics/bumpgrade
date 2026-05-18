#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$APP_ROOT/../.." && pwd)"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-$ANDROID_HOME/build-tools/36.0.0}"
PLATFORM_JAR="${ANDROID_PLATFORM_JAR:-$ANDROID_HOME/platforms/android-36/android.jar}"
AVD_NAME="${ANDROID_AVD_NAME:-MusicWebs_API_36}"
SCREENSHOT_PATH="${ANDROID_SCREENSHOT_PATH:-$REPO_ROOT/docs/pr-screenshots/issue-68-android-mobile-admin-emulator.png}"

AAPT2="$BUILD_TOOLS/aapt2"
D8="$BUILD_TOOLS/d8"
ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"
ADB="$ANDROID_HOME/platform-tools/adb"
EMULATOR="$ANDROID_HOME/emulator/emulator"
KEYTOOL="${KEYTOOL:-keytool}"

for tool in "$AAPT2" "$D8" "$ZIPALIGN" "$APKSIGNER" "$ADB" "$EMULATOR" "$KEYTOOL"; do
  if ! command -v "$tool" >/dev/null 2>&1 && [[ ! -x "$tool" ]]; then
    echo "Missing Android smoke dependency: $tool" >&2
    exit 1
  fi
done

npm --prefix "$APP_ROOT" run fixture:sync

SRC_ROOT="$APP_ROOT/android/src/main"
BUILD_ROOT="$APP_ROOT/android/build"
rm -rf "$BUILD_ROOT"
mkdir -p "$BUILD_ROOT/compiled" "$BUILD_ROOT/gen" "$BUILD_ROOT/classes" "$BUILD_ROOT/dex"

"$AAPT2" compile --dir "$SRC_ROOT/res" -o "$BUILD_ROOT/compiled/resources.zip"
"$AAPT2" link \
  -I "$PLATFORM_JAR" \
  --manifest "$APP_ROOT/android/AndroidManifest.xml" \
  --min-sdk-version 24 \
  --target-sdk-version 36 \
  -A "$SRC_ROOT/assets" \
  --java "$BUILD_ROOT/gen" \
  --auto-add-overlay \
  -o "$BUILD_ROOT/bumpgrade-mobile-admin-unaligned.apk" \
  "$BUILD_ROOT/compiled/resources.zip"

javac \
  -source 17 \
  -target 17 \
  -classpath "$PLATFORM_JAR" \
  -d "$BUILD_ROOT/classes" \
  $(find "$BUILD_ROOT/gen" "$SRC_ROOT/java" -name '*.java' | sort)

"$D8" --lib "$PLATFORM_JAR" --output "$BUILD_ROOT/dex" $(find "$BUILD_ROOT/classes" -name '*.class' | sort)
cp "$BUILD_ROOT/bumpgrade-mobile-admin-unaligned.apk" "$BUILD_ROOT/bumpgrade-mobile-admin-unsigned.apk"
(cd "$BUILD_ROOT/dex" && zip -q -j "$BUILD_ROOT/bumpgrade-mobile-admin-unsigned.apk" classes.dex)

"$KEYTOOL" \
  -genkeypair \
  -keystore "$BUILD_ROOT/debug.keystore" \
  -storepass android \
  -keypass android \
  -alias androiddebugkey \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Bumpgrade,C=US" >/dev/null

"$ZIPALIGN" -f -p 4 "$BUILD_ROOT/bumpgrade-mobile-admin-unsigned.apk" "$BUILD_ROOT/bumpgrade-mobile-admin-aligned.apk"
"$APKSIGNER" sign \
  --ks "$BUILD_ROOT/debug.keystore" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$BUILD_ROOT/bumpgrade-mobile-admin.apk" \
  "$BUILD_ROOT/bumpgrade-mobile-admin-aligned.apk"
"$APKSIGNER" verify "$BUILD_ROOT/bumpgrade-mobile-admin.apk"

serial="${ANDROID_SERIAL:-}"
if [[ -z "$serial" ]]; then
  serial="$("$ADB" devices | awk '/device$/{print $1; exit}')"
fi

if [[ -z "$serial" ]]; then
  "$EMULATOR" -avd "$AVD_NAME" -no-snapshot-save -no-boot-anim -netdelay none -netspeed full >/tmp/bumpgrade-android-emulator.log 2>&1 &
  "$ADB" wait-for-device
  serial="$("$ADB" devices | awk '/device$/{print $1; exit}')"
fi

if [[ -z "$serial" ]]; then
  echo "No Android emulator/device became available." >&2
  exit 1
fi

adb_for_device=("$ADB" "-s" "$serial")
for _ in {1..90}; do
  if [[ "$("${adb_for_device[@]}" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; then
    break
  fi
  sleep 2
done

"${adb_for_device[@]}" install -r "$BUILD_ROOT/bumpgrade-mobile-admin.apk" >/dev/null
"${adb_for_device[@]}" shell am start -n com.bumpgrade.mobileadmin/.MainActivity >/dev/null
sleep 3
mkdir -p "$(dirname "$SCREENSHOT_PATH")"
"${adb_for_device[@]}" exec-out screencap -p > "$SCREENSHOT_PATH"
echo "Android smoke screenshot saved to $SCREENSHOT_PATH"
