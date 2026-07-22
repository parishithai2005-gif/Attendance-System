#include "sheets.h"
#include "config.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <WiFi.h>

// ── Parse Apps Script response ────────────────────────────
// Your Apps Script returns {"status":"success"} or {"status":"error","message":"..."}
static bool parseAppsScriptSuccess(const String& response) {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, response);
  if (err) {
    Serial.printf("[SHEET] JSON parse error: %s\n", err.c_str());
    return false;
  }

  // Handle both formats: {"status":"success"} and {"success":true}
  if (doc["status"].is<const char*>()) {
    String status = doc["status"].as<const char*>();
    if (status == "success") return true;
    String msg = doc["message"] | "unknown error";
    Serial.printf("[SHEET] Apps Script error: %s\n", msg.c_str());
    return false;
  }

  // Fallback: {"success":true}
  bool ok = doc["success"] | false;
  if (!ok) {
    String msg = doc["error"] | doc["message"] | "unknown error";
    Serial.printf("[SHEET] Apps Script error: %s\n", msg.c_str());
  }
  return ok;
}

// ── Generic POST with redirect handling ───────────────────
static bool postToAppsScript(String payload, String& responseOut) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[SHEET] ERROR: WiFi not connected.");
    return false;
  }

  Serial.printf("[SHEET] Payload: %s\n", payload.c_str());

  String redirectUrl = "";

  // Step 1: POST → expect 302 redirect. Retry up to 3 times for SSL EOF
  for (int attempt = 1; attempt <= 3; attempt++) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, APPS_SCRIPT_URL);
    http.addHeader("Content-Type", "application/json");
    http.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);
    http.setTimeout(15000);

    int code = http.POST(payload);
    Serial.printf("[SHEET] Step 1 attempt %d code: %d\n", attempt, code);

    if (code == 200 || code == 201) {
      responseOut = http.getString();
      http.end();
      Serial.printf("[SHEET] Direct response: %s\n", responseOut.c_str());
      return parseAppsScriptSuccess(responseOut);
    }
    if (code == 302 || code == 301) {
      redirectUrl = http.getLocation();
      Serial.printf("[SHEET] Redirect: %s\n", redirectUrl.c_str());
      http.end();
      break; // Success, break out of retry loop
    } else {
      Serial.printf("[SHEET] Step 1 failed, code: %d\n", code);
      http.end();
      if (code == -1) {
        Serial.printf("[SHEET] SSL EOF on POST, retrying...\n");
        delay(attempt * 500);
        continue;
      }
      return false; // Hard failure for other codes
    }
  }

  if (redirectUrl.length() == 0) {
    Serial.println("[SHEET] No redirect URL.");
    return false;
  }

  // Step 2: GET redirect — retry up to 3 times for SSL EOF
  for (int attempt = 1; attempt <= 3; attempt++) {
    delay(attempt * 200);

    WiFiClientSecure client2;
    client2.setInsecure();
    HTTPClient http2;
    http2.begin(client2, redirectUrl);
    http2.setTimeout(15000);

    int code = http2.GET();
    Serial.printf("[SHEET] Step 2 attempt %d code: %d\n", attempt, code);

    if (code == 200) {
      responseOut = http2.getString();
      http2.end();
      Serial.printf("[SHEET] Response: %s\n", responseOut.c_str());
      return parseAppsScriptSuccess(responseOut);
    }

    http2.end();

    if (code == -1) {
      Serial.printf("[SHEET] SSL EOF, retrying...\n");
      continue;
    }
    break;
  }

  Serial.println("[SHEET] Step 2 failed after retries.");
  return false;
}

// ── Register Fingerprint ──────────────────────────────────
// Uses updateEmployee action — writes Fingerprint ID into Employee Details
bool sendRegisterFingerprint(String employeeId, String fingerprintId) {
  JsonDocument doc;
  doc["action"] = "updateEmployee";
  JsonObject data = doc["data"].to<JsonObject>();
  data["Employee ID"]     = employeeId.c_str();
  data["Fingerprint ID"]  = fingerprintId.c_str();

  String payload, response;
  serializeJson(doc, payload);

  bool ok = postToAppsScript(payload, response);
  Serial.printf("[SHEET] registerFingerprint %s\n", ok ? "OK" : "FAILED");
  return ok;
}

// ── Check In ─────────────────────────────────────────────
bool sendCheckIn(String empId, String empName, String date, String time) {
  JsonDocument doc;
  doc["action"] = "punchAttendanceLog";
  JsonObject d = doc["data"].to<JsonObject>();
  d["Employee ID"] = empId;
  d["Name"]        = empName;
  d["Date"]        = date;
  d["Time"]        = time;
  d["Action"]      = "CheckIn";
  String p, r; serializeJson(doc, p);
  return postToAppsScript(p, r);
}

// ── Return ─────────────────────────────────────────────
bool sendReturn(String empId, String empName, String date, String time) {
  JsonDocument doc;
  doc["action"] = "punchAttendanceLog";
  JsonObject d = doc["data"].to<JsonObject>();
  d["Employee ID"] = empId;
  d["Name"]        = empName;
  d["Date"]        = date;
  d["Time"]        = time;
  d["Action"]      = "Return";
  String p, r; serializeJson(doc, p);
  return postToAppsScript(p, r);
}

// ── Check Out ────────────────────────────────────────────
bool sendCheckOut(String empId, String empName, String date, String time, String mode) {
  // Map mode to action string
  String action;
  if (mode == "Onduty")     action = "CheckOut_OnDuty";
  else if (mode == "Lunch") action = "CheckOut_Lunch";
  else if (mode == "Permission") action = "CheckOut_Permission";
  else                      action = "CheckOut_DayClose";

  JsonDocument doc;
  doc["action"] = "punchAttendanceLog";
  JsonObject d = doc["data"].to<JsonObject>();
  d["Employee ID"] = empId;
  d["Name"]        = empName;
  d["Date"]        = date;
  d["Time"]        = time;
  d["Action"]      = action;
  String p, r; serializeJson(doc, p);
  return postToAppsScript(p, r);
}

bool fetchDashboardStats(DashboardStats& out) {
  if (WiFi.status() != WL_CONNECTED) return false;

  String url = String(APPS_SCRIPT_URL) + "?action=getDashboardStats";
  String response;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, url);
  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
  http.setTimeout(15000);

  int code = http.GET();
  Serial.printf("[DASH] HTTP code: %d\n", code);

  if (code != 200) { http.end(); return false; }

  response = http.getString();
  http.end();
  Serial.printf("[DASH] Response: %s\n", response.c_str());

  JsonDocument doc;
  if (deserializeJson(doc, response) != DeserializationError::Ok) return false;
  if (String(doc["status"].as<const char*>()) != "success") return false;

  out.presentToday        = doc["presentToday"]        | 0;
  out.monthPresentPct     = doc["monthPresentPct"]     | 0;
  out.monthWorkingHrsPct  = doc["monthWorkingHrsPct"]  | 0;
  out.monthOnTimeEntryPct = doc["monthOnTimeEntryPct"] | 0;
  out.monthOnTimeExitPct  = doc["monthOnTimeExitPct"]  | 0;

  return true;
}

bool fetchEmployeeStats(const String& empId, EmployeeStats& out) {
  if (WiFi.status() != WL_CONNECTED) return false;

  String url = String(APPS_SCRIPT_URL) + "?action=getEmployeeStats&empId=" + empId;
  String response;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, url);
  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
  http.setTimeout(15000);

  int code = http.GET();
  Serial.printf("[SHEET] getEmployeeStats HTTP code: %d\n", code);

  if (code != 200) { http.end(); return false; }

  response = http.getString();
  http.end();
  Serial.printf("[SHEET] Response: %s\n", response.c_str());

  JsonDocument doc;
  if (deserializeJson(doc, response) != DeserializationError::Ok) return false;
  if (String(doc["status"].as<const char*>()) != "success") return false;

  out.presentDays    = doc["presentDays"]    | 0;
  out.absentDays     = doc["absentDays"]     | 0;
  out.workHrsPct     = doc["workHrsPct"]     | 0;
  out.avgWorkHrs     = doc["avgWorkHrs"]     | "-";
  out.onTimeEntryPct = doc["onTimeEntryPct"] | 0;
  out.avgEntryTime   = doc["avgEntryTime"]   | "-";
  out.onTimeExitPct  = doc["onTimeExitPct"]  | 0;
  out.avgExitTime    = doc["avgExitTime"]    | "-";

  return true;
}