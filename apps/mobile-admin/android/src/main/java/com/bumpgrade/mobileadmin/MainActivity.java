package com.bumpgrade.mobileadmin;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity {
  private static final int COLOR_BG = Color.rgb(245, 247, 242);
  private static final int COLOR_TEXT = Color.rgb(12, 18, 15);
  private static final int COLOR_BODY = Color.rgb(79, 91, 83);
  private static final int COLOR_GREEN = Color.rgb(37, 69, 50);
  private static final int COLOR_GOLD = Color.rgb(117, 96, 22);
  private static final int COLOR_BORDER = Color.rgb(217, 222, 214);

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    try {
      JSONObject contract = new JSONObject(readAsset("mobile-admin-contract.json"));
      JSONObject androidSlice = findPlatformSlice(contract.getJSONArray("childIssues"), "android");
      JSONObject liveDashboard = contract.getJSONObject("liveDashboard");
      JSONObject privateAuth = contract.getJSONObject("privateAuth");
      JSONObject privateRowsApi = contract.getJSONObject("privateRowsApi");
      JSONObject privateRowActionsApi = contract.getJSONObject("privateRowActionsApi");
      JSONObject directorReviewApi = contract.getJSONObject("directorReviewApi");
      JSONObject actionIntentApi = contract.getJSONObject("actionIntentApi");
      JSONObject pushNotificationBoundary = contract.getJSONObject("pushNotificationBoundary");
      JSONObject distributionReadiness = contract.getJSONObject("distributionReadiness");
      JSONObject androidPushProvider = findPlatformSlice(pushNotificationBoundary.getJSONArray("requiredProviders"), "android");
      JSONObject androidDistributionEvidence = findPlatformSlice(distributionReadiness.getJSONArray("platformEvidence"), "android");
      JSONArray jobs = contract.getJSONArray("jobs");
      JSONArray confirmedActions = contract.getJSONArray("confirmedActions");

      ScrollView scrollView = new ScrollView(this);
      scrollView.setBackgroundColor(COLOR_BG);

      LinearLayout content = new LinearLayout(this);
      content.setOrientation(LinearLayout.VERTICAL);
      content.setPadding(dp(20), dp(28), dp(20), dp(44));
      scrollView.addView(content, new ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ));

      content.addView(badge(androidSlice.optString("status", "android scaffold")));
      content.addView(title("Bumpgrade mobile admin"));
      content.addView(body(
        "The first Android screen reads the checked-in fixture generated from /mobile-admin/source-data and keeps issue #"
          + androidSlice.optInt("issue", 68)
          + " read-only."
      ));

      LinearLayout sourcePanel = panel();
      sourcePanel.addView(kicker("Source contract"));
      sourcePanel.addView(panelTitle(contract.getString("id")));
      sourcePanel.addView(body("Parent issue #" + contract.getInt("parentIssue") + ". Feature " + contract.getString("featureId") + "."));
      sourcePanel.addView(meta(androidSlice.optString("sourceDataRoute", "/mobile-admin/android/source-data")));
      content.addView(sourcePanel);

      LinearLayout dashboardPanel = panel();
      dashboardPanel.addView(kicker("Live dashboard"));
      TextView dashboardTitle = panelTitle(liveDashboard.getString("route"));
      TextView dashboardBody = body(liveDashboard.getString("purpose"));
      TextView dashboardStatus = meta("Status: " + liveDashboard.getString("status") + " · issue #" + liveDashboard.getInt("issue"));
      TextView dashboardSource = meta("Source: Fixture fallback");
      TextView dashboardBoundary = meta("Boundary: " + liveDashboard.getString("redactionBoundary"));
      dashboardPanel.addView(dashboardTitle);
      dashboardPanel.addView(dashboardBody);
      dashboardPanel.addView(dashboardStatus);
      dashboardPanel.addView(dashboardSource);
      dashboardPanel.addView(dashboardBoundary);
      content.addView(dashboardPanel);
      LinearLayout directorPanel = panel();
      directorPanel.addView(kicker("Director brief"));
      directorPanel.addView(panelTitle("Workstreams"));
      TextView directorBody = body("Director brief loads from /mobile-admin/dashboard/source-data.");
      TextView directorWorkstreams = meta("Marketing, Security / Trust, Mobile Admin, and other workstreams are grouped in the live Director digest.");
      directorPanel.addView(directorBody);
      directorPanel.addView(directorWorkstreams);
      content.addView(directorPanel);

      fetchLiveDashboard(
        contract,
        liveDashboard,
        dashboardTitle,
        dashboardBody,
        dashboardStatus,
        dashboardSource,
        dashboardBoundary,
        directorBody,
        directorWorkstreams
      );

      LinearLayout authPanel = panel();
      authPanel.addView(kicker("Private auth"));
      authPanel.addView(panelTitle(privateAuth.getString("status")));
      authPanel.addView(body(privateAuth.getString("sessionSemantics")));
      authPanel.addView(meta("Session: " + privateAuth.getString("sessionRoute")));
      authPanel.addView(meta("Login: " + privateAuth.getString("loginRoute") + " -> " + privateAuth.getString("callbackSurface")));
      authPanel.addView(meta("Roles: " + joinStrings(privateAuth.getJSONArray("acceptedRoles"))));
      authPanel.addView(meta("Denied: " + joinStrings(privateAuth.getJSONArray("deniedStates"))));
      authPanel.addView(meta("Boundary: " + privateAuth.getString("redactionBoundary")));
      content.addView(authPanel);

      LinearLayout privateRowsPanel = panel();
      privateRowsPanel.addView(kicker("Private rows API"));
      privateRowsPanel.addView(panelTitle(privateRowsApi.getString("route")));
      privateRowsPanel.addView(body(privateRowsApi.getString("purpose")));
      privateRowsPanel.addView(meta("Status: " + privateRowsApi.getString("status") + " · issue #" + privateRowsApi.getInt("issue")));
      privateRowsPanel.addView(meta("Auth: " + privateRowsApi.getString("authBoundary")));
      privateRowsPanel.addView(meta("Boundary: " + privateRowsApi.getString("readBoundary")));
      content.addView(privateRowsPanel);

      LinearLayout privateRowActionsPanel = panel();
      privateRowActionsPanel.addView(kicker("Private row actions API"));
      privateRowActionsPanel.addView(panelTitle(privateRowActionsApi.getString("route")));
      privateRowActionsPanel.addView(body(privateRowActionsApi.getString("purpose")));
      privateRowActionsPanel.addView(meta("Status: " + privateRowActionsApi.getString("status") + " · issue #" + privateRowActionsApi.getInt("issue")));
      privateRowActionsPanel.addView(meta("Auth: " + privateRowActionsApi.getString("authBoundary")));
      privateRowActionsPanel.addView(meta("Boundary: " + privateRowActionsApi.getString("actionBoundary")));
      privateRowActionsPanel.addView(meta("Inputs: " + joinStrings(privateRowActionsApi.getJSONArray("requiredInputs"))));
      content.addView(privateRowActionsPanel);

      LinearLayout directorReviewPanel = panel();
      directorReviewPanel.addView(kicker("Director review API"));
      directorReviewPanel.addView(panelTitle(directorReviewApi.getString("route")));
      directorReviewPanel.addView(body(directorReviewApi.getString("purpose")));
      directorReviewPanel.addView(meta("Status: " + directorReviewApi.getString("status") + " · issue #" + directorReviewApi.getInt("issue")));
      directorReviewPanel.addView(meta("Auth: " + directorReviewApi.getString("authBoundary")));
      directorReviewPanel.addView(meta("Boundary: " + directorReviewApi.getString("reviewBoundary")));
      directorReviewPanel.addView(meta("Inputs: " + joinStrings(directorReviewApi.getJSONArray("requiredInputs"))));
      content.addView(directorReviewPanel);

      LinearLayout actionIntentPanel = panel();
      actionIntentPanel.addView(kicker("Action intent API"));
      actionIntentPanel.addView(panelTitle(actionIntentApi.getString("route")));
      actionIntentPanel.addView(body(actionIntentApi.getString("purpose")));
      actionIntentPanel.addView(meta("Status: " + actionIntentApi.getString("status") + " · issue #" + actionIntentApi.getInt("issue")));
      actionIntentPanel.addView(meta("Auth: " + actionIntentApi.getString("authBoundary")));
      actionIntentPanel.addView(meta("Boundary: " + actionIntentApi.getString("intentBoundary")));
      actionIntentPanel.addView(meta("Inputs: " + joinStrings(actionIntentApi.getJSONArray("requiredInputs"))));
      content.addView(actionIntentPanel);

      LinearLayout pushBoundaryPanel = panel();
      pushBoundaryPanel.addView(kicker("Push boundary"));
      pushBoundaryPanel.addView(panelTitle(pushNotificationBoundary.getString("status")));
      pushBoundaryPanel.addView(body(pushNotificationBoundary.getString("purpose")));
      pushBoundaryPanel.addView(meta("Send: " + pushNotificationBoundary.getString("sendCapability")));
      pushBoundaryPanel.addView(meta("Provider: " + androidPushProvider.getString("platform").toUpperCase() + " " + androidPushProvider.getString("provider")));
      pushBoundaryPanel.addView(meta("Needs: " + joinStrings(androidPushProvider.getJSONArray("requiredEvidence"))));
      pushBoundaryPanel.addView(meta("Blocked: " + joinStrings(pushNotificationBoundary.getJSONArray("blockedBy"))));
      pushBoundaryPanel.addView(meta("Redaction: " + joinStrings(pushNotificationBoundary.getJSONArray("redactionFlags"))));
      content.addView(pushBoundaryPanel);

      LinearLayout distributionPanel = panel();
      distributionPanel.addView(kicker("Distribution boundary"));
      distributionPanel.addView(panelTitle(distributionReadiness.getString("status")));
      distributionPanel.addView(body(distributionReadiness.getString("purpose")));
      distributionPanel.addView(meta("Installable claim: " + (distributionReadiness.getBoolean("installableDistributionClaim") ? "live" : "not live")));
      distributionPanel.addView(meta("Evidence: " + androidDistributionEvidence.getString("currentEvidence")));
      distributionPanel.addView(meta("Needs: " + joinStrings(androidDistributionEvidence.getJSONArray("requiredBeforeClaim"))));
      distributionPanel.addView(meta("Blocked: " + joinStrings(androidDistributionEvidence.getJSONArray("blockedBy"))));
      content.addView(distributionPanel);

      content.addView(sectionLabel("Phone jobs"));
      for (int index = 0; index < Math.min(3, jobs.length()); index += 1) {
        JSONObject job = jobs.getJSONObject(index);
        LinearLayout card = panel();
        card.addView(badge(job.getString("firstScreen")));
        card.addView(cardTitle(job.getString("title")));
        card.addView(body(job.getString("goal")));
        card.addView(meta("User: " + job.getString("primaryUser")));
        card.addView(meta("Routes: " + joinStrings(job.getJSONArray("sourceRoutes"))));
        card.addView(meta("Boundary: " + job.getString("writeBoundary")));
        content.addView(card);
      }

      content.addView(sectionLabel("Confirmed mobile actions"));
      for (int index = 0; index < Math.min(2, confirmedActions.length()); index += 1) {
        JSONObject action = confirmedActions.getJSONObject(index);
        LinearLayout card = panel();
        card.addView(badge(action.getString("status")));
        card.addView(cardTitle(action.getString("title")));
        card.addView(body(action.getString("mutationBoundary")));
        card.addView(meta("Surface: " + action.getString("surface")));
        card.addView(meta("Confirmation: " + action.getString("confirmationText")));
        card.addView(meta("Inputs: " + joinStrings(action.getJSONArray("requiredInputs"))));
        content.addView(card);
      }

      setContentView(scrollView);
    } catch (Exception error) {
      TextView fallback = body("Bumpgrade mobile admin failed to read fixture: " + error.getMessage());
      fallback.setPadding(dp(20), dp(40), dp(20), dp(20));
      setContentView(fallback);
    }
  }

  private String readAsset(String name) throws Exception {
    try (InputStream input = getAssets().open(name); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      byte[] buffer = new byte[4096];
      int read;
      while ((read = input.read(buffer)) != -1) {
        output.write(buffer, 0, read);
      }
      return output.toString(StandardCharsets.UTF_8.name());
    }
  }

  private void fetchLiveDashboard(
    JSONObject contract,
    JSONObject fixtureDashboard,
    TextView dashboardTitle,
    TextView dashboardBody,
    TextView dashboardStatus,
    TextView dashboardSource,
    TextView dashboardBoundary,
    TextView directorBody,
    TextView directorWorkstreams
  ) {
    new Thread(() -> {
      HttpURLConnection connection = null;
      try {
        URL url = new URL(contract.getString("publicBaseUrl") + fixtureDashboard.getString("route"));
        connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(3000);
        connection.setReadTimeout(3000);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "application/json");
        if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) {
          return;
        }

        JSONObject payload = new JSONObject(readStream(connection.getInputStream()));
        String bodyText = liveDashboardSummary(payload);
        String boundaryText = redactionSummary(payload.optJSONObject("redaction"), fixtureDashboard.getString("redactionBoundary"));
        String directorText = directorSummary(payload);
        String directorWorkstreamText = directorWorkstreamSummary(payload);
        runOnUiThread(() -> {
          dashboardTitle.setText(payload.optString("route", fixtureDashboard.optString("route")));
          dashboardBody.setText(bodyText);
          dashboardStatus.setText("Status: " + payload.optString("status", fixtureDashboard.optString("status")) + " · issue #" + payload.optInt("issue", fixtureDashboard.optInt("issue")));
          dashboardSource.setText("Source: Live network");
          dashboardBoundary.setText("Boundary: " + boundaryText);
          directorBody.setText(directorText);
          directorWorkstreams.setText(directorWorkstreamText);
        });
      } catch (Exception ignored) {
        runOnUiThread(() -> dashboardSource.setText("Source: Fixture fallback"));
      } finally {
        if (connection != null) {
          connection.disconnect();
        }
      }
    }).start();
  }

  private String readStream(InputStream input) throws Exception {
    try (InputStream stream = input; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      byte[] buffer = new byte[4096];
      int read;
      while ((read = stream.read(buffer)) != -1) {
        output.write(buffer, 0, read);
      }
      return output.toString(StandardCharsets.UTF_8.name());
    }
  }

  private String liveDashboardSummary(JSONObject payload) {
    JSONObject counts = payload.optJSONObject("adminDigest") != null
      ? payload.optJSONObject("adminDigest").optJSONObject("counts")
      : null;
    if (counts == null) {
      return "Live public-safe dashboard payload loaded.";
    }
    return "Roadmap "
      + counts.optInt("roadmapItems", 0)
      + ", work logs "
      + counts.optInt("workLogEntries", 0)
      + ", journeys "
      + counts.optInt("userJourneys", 0)
      + ", attention "
      + counts.optInt("openAttentionItems", 0)
      + ".";
  }

  private String redactionSummary(JSONObject redaction, String fallbackBoundary) {
    if (redaction == null || redaction.length() == 0) {
      return fallbackBoundary;
    }
    JSONArray keys = redaction.names();
    for (int index = 0; keys != null && index < keys.length(); index += 1) {
      if (redaction.optBoolean(keys.optString(index), true)) {
        return fallbackBoundary;
      }
    }
    return "Redaction: " + redaction.length() + " private-data flags false.";
  }

  private String directorSummary(JSONObject payload) {
    JSONObject digest = payload.optJSONObject("directorDigest");
    JSONObject totals = digest != null ? digest.optJSONObject("totals") : null;
    if (totals == null) {
      return "Director brief loaded without totals.";
    }
    return "Director: "
      + totals.optInt("workstreams", 0)
      + " workstreams, "
      + totals.optInt("needsMark", 0)
      + " need Mark, "
      + totals.optInt("changedPastWeek", 0)
      + " changed this week.";
  }

  private String directorWorkstreamSummary(JSONObject payload) {
    JSONObject digest = payload.optJSONObject("directorDigest");
    JSONArray workstreams = digest != null ? digest.optJSONArray("workstreams") : null;
    if (workstreams == null || workstreams.length() == 0) {
      return "Marketing, Security / Trust, Mobile Admin, and other workstreams are grouped in the live Director digest.";
    }

    StringBuilder builder = new StringBuilder();
    int limit = Math.min(5, workstreams.length());
    for (int index = 0; index < limit; index += 1) {
      JSONObject workstream = workstreams.optJSONObject(index);
      if (workstream == null) continue;
      JSONObject counts = workstream.optJSONObject("counts");
      JSONObject brief = workstream.optJSONObject("brief");
      if (builder.length() > 0) builder.append("\n");
      builder
        .append(workstream.optString("title", "Workstream"))
        .append(": ")
        .append(workstream.optString("status", "unknown"))
        .append("; ")
        .append(counts != null ? counts.optInt("changedPastWeek", 0) : 0)
        .append(" changed 7d; ")
        .append(counts != null ? counts.optInt("needsMark", 0) : 0)
        .append(" need Mark. ")
        .append(brief != null ? brief.optString("headline", workstream.optString("currentFocus", "")) : workstream.optString("currentFocus", ""));
    }
    return builder.toString();
  }

  private JSONObject findPlatformSlice(JSONArray slices, String platform) throws Exception {
    for (int index = 0; index < slices.length(); index += 1) {
      JSONObject slice = slices.getJSONObject(index);
      if (platform.equals(slice.getString("platform"))) {
        return slice;
      }
    }
    throw new IllegalStateException("Missing platform slice: " + platform);
  }

  private String joinStrings(JSONArray values) throws Exception {
    StringBuilder builder = new StringBuilder();
    for (int index = 0; index < values.length(); index += 1) {
      if (index > 0) builder.append(", ");
      builder.append(values.getString(index));
    }
    return builder.toString();
  }

  private LinearLayout panel() {
    LinearLayout view = new LinearLayout(this);
    view.setOrientation(LinearLayout.VERTICAL);
    view.setPadding(dp(18), dp(18), dp(18), dp(18));
    GradientDrawable background = new GradientDrawable();
    background.setColor(Color.WHITE);
    background.setStroke(dp(1), COLOR_BORDER);
    background.setCornerRadius(dp(8));
    view.setBackground(background);

    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    );
    params.setMargins(0, dp(16), 0, 0);
    view.setLayoutParams(params);
    return view;
  }

  private TextView badge(String text) {
    TextView view = text(text.toUpperCase(), 12, COLOR_GREEN, Typeface.BOLD);
    view.setPadding(dp(10), dp(6), dp(10), dp(6));
    GradientDrawable background = new GradientDrawable();
    background.setColor(Color.rgb(233, 240, 229));
    background.setCornerRadius(dp(999));
    view.setBackground(background);
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    );
    params.setMargins(0, dp(8), 0, dp(12));
    view.setLayoutParams(params);
    return view;
  }

  private TextView title(String value) {
    TextView view = text(value, 38, COLOR_TEXT, Typeface.BOLD);
    view.setLineSpacing(dp(2), 1.0f);
    return view;
  }

  private TextView panelTitle(String value) {
    return text(value, 20, COLOR_TEXT, Typeface.BOLD);
  }

  private TextView cardTitle(String value) {
    return text(value, 24, COLOR_TEXT, Typeface.BOLD);
  }

  private TextView body(String value) {
    TextView view = text(value, 17, COLOR_BODY, Typeface.NORMAL);
    view.setLineSpacing(dp(4), 1.0f);
    return view;
  }

  private TextView meta(String value) {
    return text(value, 13, Color.rgb(93, 104, 70), Typeface.BOLD);
  }

  private TextView kicker(String value) {
    return text(value.toUpperCase(), 12, COLOR_GOLD, Typeface.BOLD);
  }

  private TextView sectionLabel(String value) {
    TextView view = text(value.toUpperCase(), 14, COLOR_GOLD, Typeface.BOLD);
    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT
    );
    params.setMargins(0, dp(28), 0, 0);
    view.setLayoutParams(params);
    return view;
  }

  private TextView text(String value, int sp, int color, int style) {
    TextView view = new TextView(this);
    view.setText(value);
    view.setTextSize(sp);
    view.setTextColor(color);
    view.setTypeface(Typeface.DEFAULT, style);
    view.setIncludeFontPadding(true);
    return view;
  }

  private int dp(int value) {
    return Math.round(value * getResources().getDisplayMetrics().density);
  }
}
