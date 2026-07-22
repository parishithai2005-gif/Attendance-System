#include "employees.h"
#include "config.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Preferences.h>

static Employee employees[MAX_EMPLOYEES];
static int employeeCount = 0;
static Preferences prefs;

static String jsonStr(JsonObject obj, const char* key) {
  if (obj[key].is<const char*>()) {
    String s = obj[key].as<const char*>();
    s.trim();
    return s;
  }
  if (obj[key].is<int>()) {
    return String(obj[key].as<int>());
  }
  return "";
}

void initEmployeeStore() {
  loadEmployeesFromFlash();
  Serial.printf("[EMP] Loaded %d employees from flash.\n", employeeCount);
}

bool syncEmployeesFromSheet() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[EMP] No WiFi, skipping sync.");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, APPS_SCRIPT_GET_URL);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.setTimeout(15000);

  int code = http.GET();
  Serial.printf("[EMP] Sync HTTP code: %d\n", code);

  String payload = http.getString();
  http.end();

  Serial.printf("[EMP] Payload preview: %.300s\n", payload.c_str());

  if (code != 200) {
    Serial.printf("[EMP] Sync failed, code: %d\n", code);
    return false;
  }

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.print("[EMP] JSON parse failed: ");
    Serial.println(err.c_str());
    return false;
  }

  JsonArray arr = doc.as<JsonArray>();
  int count = 0;

  for (JsonObject obj : arr) {
    if (count >= MAX_EMPLOYEES) break;

    String id = jsonStr(obj, "id");
    if (id.length() == 0 || id == "null") continue;

    employees[count].id            = id;
    employees[count].name          = jsonStr(obj, "name");
    employees[count].password      = jsonStr(obj, "password");
    employees[count].dob           = jsonStr(obj, "dob");
    employees[count].gender        = jsonStr(obj, "gender");
    employees[count].dateOfJoining = jsonStr(obj, "doj");
    employees[count].fpSlot        = obj["fpSlot"].is<int>() ? obj["fpSlot"].as<int>() : -1;

    Serial.printf("[EMP]   Loaded: %s | %s | fpSlot:%d\n",
      employees[count].id.c_str(),
      employees[count].name.c_str(),
      employees[count].fpSlot);

    count++;
  }

  employeeCount = count;
  saveEmployeesToFlash();
  Serial.printf("[EMP] Synced %d employees from sheet.\n", employeeCount);
  return true;
}

bool addEmployeeLocally(Employee e) {
  if (employeeCount >= MAX_EMPLOYEES) return false;
  employees[employeeCount++] = e;
  saveEmployeesToFlash();
  return true;
}

Employee* findEmployeeById(String id) {
  id.trim();
  Serial.printf("[EMP] findById '%s', cache has %d employees\n", id.c_str(), employeeCount);
  for (int i = 0; i < employeeCount; i++) {
    Serial.printf("[EMP]   checking '%s'\n", employees[i].id.c_str());
    if (employees[i].id.equalsIgnoreCase(id)) return &employees[i];
  }
  return nullptr;
}

Employee* findEmployeeByFpSlot(int slot) {
  for (int i = 0; i < employeeCount; i++) {
    if (employees[i].fpSlot == slot) return &employees[i];
  }
  return nullptr;
}

int getEmployeeCount() { return employeeCount; }

void saveEmployeesToFlash() {
  JsonDocument doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < employeeCount; i++) {
    JsonObject o = arr.add<JsonObject>();
    o["id"]       = employees[i].id.c_str();
    o["name"]     = employees[i].name.c_str();
    o["password"] = employees[i].password.c_str();
    o["dob"]      = employees[i].dob.c_str();
    o["gender"]   = employees[i].gender.c_str();
    o["doj"]      = employees[i].dateOfJoining.c_str();
    o["fpSlot"]   = employees[i].fpSlot;
  }

  String out;
  serializeJson(doc, out);

  prefs.begin("attendance", false);
  prefs.putString("employees", out);
  prefs.end();
}

void loadEmployeesFromFlash() {
  prefs.begin("attendance", true);
  String stored = prefs.getString("employees", "[]");
  prefs.end();

  JsonDocument doc;
  if (deserializeJson(doc, stored)) return;

  JsonArray arr = doc.as<JsonArray>();
  int count = 0;

  for (JsonObject obj : arr) {
    if (count >= MAX_EMPLOYEES) break;

    String id = jsonStr(obj, "id");
    if (id.length() == 0 || id == "null") continue;

    employees[count].id            = id;
    employees[count].name          = jsonStr(obj, "name");
    employees[count].password      = jsonStr(obj, "password");
    employees[count].dob           = jsonStr(obj, "dob");
    employees[count].gender        = jsonStr(obj, "gender");
    employees[count].dateOfJoining = jsonStr(obj, "doj");
    employees[count].fpSlot        = obj["fpSlot"].is<int>() ? obj["fpSlot"].as<int>() : -1;

    count++;
  }
  employeeCount = count;
}