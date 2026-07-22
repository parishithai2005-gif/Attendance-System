// main.cpp — SparkDNA Attendance System Phase 2

#include <Arduino.h>
#include <WiFi.h>
#include <time.h>
#include "rtc.h"
#include "config.h"
#include "network.h"
#include "ntp.h"
#include "fingerprint.h"
#include "attendance.h"
#include "sheets.h"
#include "employees.h"
#include "hmi.h"
#include "registration.h"

// ── Timers ────────────────────────────────────────────────
unsigned long lastEmployeeSync    = 0;
unsigned long lastPunchMillis     = 0;
unsigned long lastDashboardUpdate = 0;
unsigned long lastClockUpdate     = 0;

// ── Menu flow state ───────────────────────────────────────
enum MenuFlowState { MENU_IDLE, MENU_PUNCHIN, MENU_PUNCHOUT, MENU_REGISTER };
MenuFlowState menuFlow  = MENU_IDLE;
String        menuEmpId   = "";
String        menuEmpName = "";
String        menuEmpPwd  = "";
static int    regSlot     = -1; // Track slot during registration

// ── Last known page ───────────────────────────────────────
uint8_t lastPage = 0xFF;
uint8_t lastValidPage = SCR_POWER_ON;
unsigned long notRecognizedTimer = 0;

// ── Screen / intent constants ─────────────────────────────
#define SCREEN_POWER_ON      SCR_POWER_ON        // 0
#define SCREEN_EMP_STATS     SCR_EMPLOYEE_STATS  // 11

#define INTENT_VAL_NONE       0
#define INTENT_VAL_DAYCLOSE   1
#define INTENT_VAL_ONDUTY     2
#define INTENT_VAL_PERMISSION 3
#define INTENT_VAL_LUNCH      4

// ── Screen 1 OK button VP ─────────────────────────────────
// Check in DGUS Tool: screen 1 → OK button → Return Key Code VP address
// Common values on your project are 0x5040, 0x5050, 0x5060
// We poll all three so it works regardless — whichever fires first wins
#define VP_SCR1_OK_A  0x5040
#define VP_SCR1_OK_B  0x5050
#define VP_SCR1_OK_C  0x5060

// ═══════════════════════════════════════════════════════════
// HMI helpers
// ═══════════════════════════════════════════════════════════

static void switchScreen(uint8_t id) {
  hmiGoToScreen(id);
}

static void showFpNotRecognized() {
  hmiGoToScreen(SCR_FP_NOT_RECOGNIZED);
  notRecognizedTimer = millis();
}

static void showInvalidEmpId() {
  hmiGoToScreen(SCR_INVALID_ID);
}

static void showIncorrectPassword() {
  hmiGoToScreen(SCR_WRONG_PASSWORD);
}



// ── Clock display ─────────────────────────────────────────
static void updateClock() {
  struct tm t;
  getTimeFromRTC(t);
  char date[11], timeStr[6];
  strftime(date,    sizeof(date),    "%Y-%m-%d", &t);
  strftime(timeStr, sizeof(timeStr), "%H:%M",    &t);
  hmiWriteText(VP_HOME_DATE, String(date));
  hmiWriteText(VP_HOME_TIME, String(timeStr));
}

// ── Low-level VP read ─────────────────────────────────────
static uint16_t readVP(uint16_t addr) {
  while (hmiSerial.available()) hmiSerial.read();
  uint8_t req[1] = { 0x01 };
  sendFrame(0x83, addr, req, 1);
  delay(40);
  if (hmiSerial.available() >= 7) {
    uint8_t buf[10]; int n = 0;
    while (hmiSerial.available() && n < 10) buf[n++] = hmiSerial.read();
    if (n >= 7 && buf[0] == 0x5A && buf[1] == 0xA5 && buf[3] == 0x83)
      return (uint16_t)(buf[n-2] << 8 | buf[n-1]);
  }
  return 0xFFFF;
}

static void clearVP(uint16_t addr) {
  uint8_t clr[2] = { 0x00, 0x00 };
  sendFrame(0x82, addr, clr, 2);
}

// ── Text field read ───────────────────────────────────────
static String readTextField(uint16_t addr) {
  delay(50);
  while (hmiSerial.available()) hmiSerial.read();

  uint8_t req[1] = { 0x0F };
  sendFrame(0x83, addr, req, 1);

  unsigned long deadline = millis() + 300;
  uint8_t buf[64];

  while (millis() < deadline) {
    if (hmiSerial.available() < 3) { delay(5); continue; }

    uint8_t h1 = hmiSerial.read();
    if (h1 != 0x5A) continue;
    uint8_t h2 = hmiSerial.read();
    if (h2 != 0xA5) continue;
    uint8_t frameLen = hmiSerial.read();

    unsigned long t = millis() + 100;
    while (hmiSerial.available() < frameLen && millis() < t) delay(2);

    int n = 0;
    while (hmiSerial.available() && n < frameLen && n < 61)
      buf[n++] = hmiSerial.read();

    if (n < 4) continue;

    uint8_t cmd = buf[0];
    if (cmd == 0x82) {
      Serial.printf("[HMI] readTextField: skipping write frame\n");
      continue;
    }

    if (cmd == 0x83 && n >= 4) {
      uint16_t respAddr = (buf[1] << 8) | buf[2];
      if (respAddr != addr) continue;
      int dataWords = buf[3];
      String s = "";
      for (int k = 0; k < dataWords * 2 && (4 + k) < n; k++) {
        char c = buf[4 + k];
        if (c == 0 || (uint8_t)c == 0xFF) break;
        s += c;
      }
      s.trim();
      Serial.printf("[HMI] readTextField 0x%04X result: '%s'\n", addr, s.c_str());
      return s;
    }
  }

  Serial.println("[HMI] readTextField: timeout");
  return "";
}

// ── Current page read ─────────────────────────────────────
static uint8_t getCurrentPage() {
  uint16_t val = readVP(0x0014);
  if (val != 0xFFFF) return (uint8_t)(val & 0xFF);
  return lastPage;
}

// ── Intent flag ───────────────────────────────────────────
static uint16_t readIntentFlag() { return readVP(0x1900); }
static void     clearIntentFlag() { clearVP(0x1900); }

// ── Check-in success screen ───────────────────────────────
// Screen 1 has name, date, and time fields
static void goToCheckinSuccess(const String& date, const String& timeFull, const String& name) {
  hmiGoToScreen(SCR_CHECKIN_SUCCESS);
  delay(500);

  // HH:MM only — 5 chars, fits any reasonable time display field
  String timeHHMM = "";
  if (timeFull.length() >= 5) {
    timeHHMM = timeFull.substring(0, 2) + "." + timeFull.substring(3, 5);
  } else {
    timeHHMM = timeFull;
  }

  // Date as DD-MM-YYYY (8 meaningful chars) instead of YYYY-MM-DD (10 chars)
  // in case the field length in DGUS is configured short
  String dateShort = "";
  if (date.length() == 10) {
    // Convert "2026-07-16" → "16-07-26"
    dateShort = date.substring(8, 10) + "-" + date.substring(5, 7) + "-" + date.substring(2, 4);
  } else {
    dateShort = date;
  }

  hmiWriteText(VP_CHECKIN_NAME, name);
  delay(50);
  hmiWriteText(VP_CHECKIN_TIME, timeHHMM);   // 0x6040 → time field
  delay(50);
  hmiWriteText(VP_CHECKIN_DATE, dateShort);  // 0x6060 → date field
  delay(50);

  Serial.printf("[HMI] CheckIn success → name='%s' time='%s' date='%s'\n",
    name.c_str(), timeHHMM.c_str(), dateShort.c_str());
}

// ── Punch Out success screen ──────────────────────────────
// Screen 7 has date and time fields
static void goToPunchOutSuccess(const String& date, const String& timeFull) {
  hmiGoToScreen(SCR_PUNCHOUT_SUCCESS);
  delay(300);
  hmiWriteText(VP_PUNCHOUT_TIME, timeFull);
  delay(20);
  hmiWriteText(VP_PUNCHOUT_DATE, date);
}

// ── Stats screen population ───────────────────────────────
static void showEmployeeStats(Employee* emp) {
  hmiGoToScreen(SCREEN_EMP_STATS);
  delay(300);

  // Write name immediately so user sees something while loading
  hmiWriteText(VP_STAT_NAME, emp->name); delay(20);

  EmployeeStats stats;
  if (fetchEmployeeStats(emp->id, stats)) {
    char p[8], a[8], w[8], e[8], x[8];
    snprintf(p, sizeof(p), "%d", stats.presentDays);
    snprintf(a, sizeof(a), "%d", stats.absentDays);
    snprintf(w, sizeof(w), "%d%%", stats.workHrsPct);
    snprintf(e, sizeof(e), "%d%%", stats.onTimeEntryPct);
    snprintf(x, sizeof(x), "%d%%", stats.onTimeExitPct);

    hmiWriteText(VP_STAT_PRESENT_DAYS,     String(p) + "   "); delay(20);
    hmiWriteText(VP_STAT_ABSENT_DAYS,      String(a) + "   "); delay(20);
    hmiWriteText(VP_STAT_WORK_HRS_PCT,     String(w) + "   "); delay(20);
    hmiWriteText(VP_STAT_AVG_WORK_HRS,     stats.avgWorkHrs + "   "); delay(20);
    hmiWriteText(VP_STAT_ONTIME_ENTRY_PCT, String(e) + "   "); delay(20);
    hmiWriteText(VP_STAT_AVG_ENTRY_TIME,   stats.avgEntryTime + "   "); delay(20);
    hmiWriteText(VP_STAT_ONTIME_EXIT_PCT,  String(x) + "   "); delay(20);
    hmiWriteText(VP_STAT_AVG_EXIT_TIME,    stats.avgExitTime + "   ");
    Serial.printf("[HMI] Stats loaded and shown for %s\n", emp->id.c_str());
  } else {
    // Fallback if network fails
    Serial.println("[HMI] Failed to fetch stats, showing zeros.");
    hmiWriteText(VP_STAT_PRESENT_DAYS,     "0"); delay(20);
    hmiWriteText(VP_STAT_ABSENT_DAYS,      "0"); delay(20);
    hmiWriteText(VP_STAT_WORK_HRS_PCT,     "0%"); delay(20);
    hmiWriteText(VP_STAT_AVG_WORK_HRS,     "0h"); delay(20);
    hmiWriteText(VP_STAT_ONTIME_ENTRY_PCT, "0%"); delay(20);
    hmiWriteText(VP_STAT_AVG_ENTRY_TIME,   "-"); delay(20);
    hmiWriteText(VP_STAT_ONTIME_EXIT_PCT,  "0%"); delay(20);
    hmiWriteText(VP_STAT_AVG_EXIT_TIME,    "-");
  }
}

// ═══════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════

static void updateDashboardSummary() {
  int n = getEmployeeCount();
  char buf[8];
  snprintf(buf, sizeof(buf), "%d", n);
  hmiWriteText(VP_DASH_NUM_EMP, String(buf));

  DashboardStats stats;
  if (fetchDashboardStats(stats)) {
    char pt[8], mp[8], mh[8], me[8], mx[8];
    snprintf(pt, sizeof(pt), "%d",   stats.presentToday);
    snprintf(mp, sizeof(mp), "%d%%", stats.monthPresentPct);
    snprintf(mh, sizeof(mh), "%d%%", stats.monthWorkingHrsPct);
    snprintf(me, sizeof(me), "%d%%", stats.monthOnTimeEntryPct);
    snprintf(mx, sizeof(mx), "%d%%", stats.monthOnTimeExitPct);

    hmiWriteText(VP_DASH_PRESENT_TODAY,  String(pt));
    hmiWriteText(VP_DASH_MONTH_PRESENT,  String(mp));
    hmiWriteText(VP_DASH_MONTH_HOURS,    String(mh));
    hmiWriteText(VP_DASH_MONTH_ON_ENTRY, String(me));
    hmiWriteText(VP_DASH_MONTH_ON_EXIT,  String(mx));

    Serial.printf("[DASH] Today:%d Present:%d%% Hours:%d%% Entry:%d%% Exit:%d%%\n",
      stats.presentToday, stats.monthPresentPct,
      stats.monthWorkingHrsPct, stats.monthOnTimeEntryPct, stats.monthOnTimeExitPct);
  } else {
    // Keep showing last known values — don't overwrite with zeros
    Serial.println("[DASH] Fetch failed, keeping current display.");
  }
}

// ═══════════════════════════════════════════════════════════
// Fingerprint punch handler
// ═══════════════════════════════════════════════════════════

static void handleFingerprintPunch(int fpSlot) {
  Employee* emp = findEmployeeByFpSlot(fpSlot);
  if (!emp) {
    fpLedBlink(FP_LED_RED, 2);
    showFpNotRecognized();
    return;
  }

  struct tm t; getTimeFromRTC(t);
  char date[11], timeFull[9];
  strftime(date,     sizeof(date),     "%Y-%m-%d", &t);
  strftime(timeFull, sizeof(timeFull), "%H:%M:%S", &t);

  EmployeeState& state = employeeStates[emp->id];
  state.id   = emp->id;
  state.name = emp->name;
  PunchType punch = resolvePunch(state, String(timeFull).substring(0, 5));

  fpLedOn(FP_LED_PURPLE);

  if (punch == PUNCH_IN) {
    bool ok = sendCheckIn(emp->id, emp->name, String(date), String(timeFull));
    fpLedBlink(ok ? FP_LED_GREEN : FP_LED_RED, 3);
    if (ok) {
      menuEmpId   = emp->id;
      menuEmpName = emp->name;
      goToCheckinSuccess(String(date), String(timeFull), emp->name);
      // Do NOT switchScreen here — page handler waits for OK button
    } else {
      switchScreen(SCR_POWER_ON);
    }
  } else if (punch == PUNCH_ONDUTY_RETURN) {
    bool ok = sendReturn(emp->id, emp->name, String(date), String(timeFull));
    fpLedBlink(ok ? FP_LED_GREEN : FP_LED_RED, 3);
    if (ok) {
      menuEmpId   = emp->id;
      menuEmpName = emp->name;
      goToCheckinSuccess(String(date), String(timeFull), emp->name);
    } else {
      switchScreen(SCR_POWER_ON);
    }
  } else {
    menuEmpId   = emp->id;
    menuEmpName = emp->name;
    switchScreen(SCR_EXIT_PURPOSE);
  }

  fpLedBreath(FP_LED_BLUE);
}

// ═══════════════════════════════════════════════════════════
// Setup
// ═══════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=================================");
  Serial.println("   SparkDNA Attendance — Phase 2");
  Serial.println("=================================");

  initNetwork();
  initRTC(); 
  initNTP();

  if (!initFingerprint()) {
    Serial.println("[FP]  WARNING: Sensor not found — will retry in loop.");
  } else {
    fpLedBreath(FP_LED_BLUE);
  }

  initEmployeeStore();
  syncEmployeesFromSheet();
  initHMI();

  updateDashboardSummary();
  updateClock();

  Serial.println("[SYS] All systems ready.");
}

// ═══════════════════════════════════════════════════════════
// Loop
// ═══════════════════════════════════════════════════════════

void loop() {
  // ── Sensor retry ───────────────────────────────────────
  static bool fpReady = false;
  if (!fpReady) {
    if (initFingerprint()) { fpReady = true; fpLedBreath(FP_LED_BLUE); }
    else { delay(2000); return; }
  }

  // ── Periodic tasks ─────────────────────────────────────
  if (millis() - lastClockUpdate > 1000) {
    updateClock();
    lastClockUpdate = millis();
  }
  if (millis() - lastEmployeeSync > EMPLOYEE_SYNC_INTERVAL) {
    syncEmployeesFromSheet();
    lastEmployeeSync = millis();
  }
  if (millis() - lastDashboardUpdate > 60000UL) {
    updateDashboardSummary();
    lastDashboardUpdate = millis();
  }

  // ── Page tracking ───────────────────────────────────────
  uint8_t page = getCurrentPage();
  if (page != lastPage) {
    Serial.printf("[HMI]  Page: %d\n", page);
    if (lastPage != 0xFF && lastPage != SCR_FP_NOT_RECOGNIZED && lastPage != SCR_INVALID_ID && lastPage != SCR_WRONG_PASSWORD) {
       lastValidPage = lastPage;
    }
    lastPage = page;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 15 — Fingerprint Not Recognized
  // ═══════════════════════════════════════════════════════
  if (page == SCR_FP_NOT_RECOGNIZED) {
    uint16_t okVal = readVP(0x1901);
    if (okVal == 1) {
      clearVP(0x1901);
      notRecognizedTimer = 0;
      switchScreen(lastValidPage);
    } else if (notRecognizedTimer > 0 && millis() - notRecognizedTimer > 2500) {
      notRecognizedTimer = 0;
      switchScreen(lastValidPage);
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 8 — Menu Options
  // ═══════════════════════════════════════════════════════
  if (page == SCR_MENU_OPTIONS) {
    uint16_t intent = readVP(0x1900);
    if (intent == 5) {
      clearVP(0x1900);
      menuFlow = MENU_PUNCHIN;
      Serial.println("[MENU] Captured Intent: Punch In");
    } else if (intent == 6) {
      clearVP(0x1900);
      menuFlow = MENU_PUNCHOUT;
      Serial.println("[MENU] Captured Intent: Punch Out");
    } else if (intent == 7) {
      clearVP(0x1900);
      menuFlow = MENU_REGISTER;
      Serial.println("[MENU] Captured Intent: Emp Registration");
    }
    // We don't return here so the loop can continue to other things
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 0 — Home: fingerprint scanning
  // ═══════════════════════════════════════════════════════
  if (page == SCREEN_POWER_ON) {
    int slotId = verifyFingerprint();
    if (slotId > 0 && millis() - lastPunchMillis > PUNCH_DEBOUNCE_MS) {
      lastPunchMillis = millis();
      handleFingerprintPunch(slotId);
    } else if (slotId == 0) {
      fpLedBlink(FP_LED_RED, 2);
      showFpNotRecognized();
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 1 — Check-In Success: wait for OK → go to stats
  // ═══════════════════════════════════════════════════════
  if (page == SCR_CHECKIN_SUCCESS) {
    // Poll all three candidate VPs — whichever the HMI team wired fires first
    bool okPressed = false;
    uint16_t firedVP = 0;

    uint16_t a = readVP(VP_SCR1_OK_A);
    if (a == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_A; }

    if (!okPressed) {
      uint16_t b = readVP(VP_SCR1_OK_B);
      if (b == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_B; }
    }

    if (!okPressed) {
      uint16_t c = readVP(VP_SCR1_OK_C);
      if (c == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_C; }
    }

    if (okPressed) {
      clearVP(firedVP);
      Serial.printf("[HMI] Screen %d OK fired at VP 0x%04X\n", SCR_CHECKIN_SUCCESS, firedVP);

      Employee* emp = findEmployeeById(menuEmpId);
      if (emp) {
        showEmployeeStats(emp);
      } else {
        Serial.println("[HMI] No menuEmpId set, going home.");
        switchScreen(SCREEN_POWER_ON);
      }
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 11 — Employee Statistics: wait for OK → go home
  // ═══════════════════════════════════════════════════════
  if (page == SCR_EMPLOYEE_STATS) {
    bool okPressed = false;
    uint16_t firedVP = 0;

    uint16_t a = readVP(VP_SCR1_OK_A);
    if (a == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_A; }
    if (!okPressed) {
      uint16_t b = readVP(VP_SCR1_OK_B);
      if (b == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_B; }
    }
    if (!okPressed) {
      uint16_t c = readVP(VP_SCR1_OK_C);
      if (c == 0x0001) { okPressed = true; firedVP = VP_SCR1_OK_C; }
    }

    if (okPressed) {
      clearVP(firedVP);
      Serial.println("[HMI] Stats Screen OK pressed, returning home.");
      switchScreen(SCREEN_POWER_ON);
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGES 3 to 6 — Confirm Exit Purpose
  // ═══════════════════════════════════════════════════════
  if (page >= SCR_CONFIRM_DAYCLOSE && page <= SCR_CONFIRM_LUNCH) {
    uint16_t intent = readIntentFlag();
    if (intent != 0xFFFF && intent != INTENT_VAL_NONE) {
      clearIntentFlag();

      struct tm t; getTimeFromRTC(t);
      char date[11], timeFull[9];
      strftime(date,     sizeof(date),     "%Y-%m-%d", &t);
      strftime(timeFull, sizeof(timeFull), "%H:%M:%S", &t);

      String mode;
      switch (intent) {
        case INTENT_VAL_DAYCLOSE:   mode = "Exit";       break;
        case INTENT_VAL_ONDUTY:     mode = "Onduty";     break;
        case INTENT_VAL_PERMISSION: mode = "Permission"; break;
        case INTENT_VAL_LUNCH:      mode = "Lunch";      break;
        default:                    mode = "Exit";        break;
      }

      fpLedOn(FP_LED_PURPLE);
      bool ok = sendCheckOut(menuEmpId, menuEmpName, String(date), String(timeFull), mode);
      fpLedBlink(ok ? FP_LED_GREEN : FP_LED_RED, 3);
      
      if (ok) {
        goToPunchOutSuccess(String(date), String(timeFull));
      } else {
        switchScreen(SCR_POWER_ON);
      }
      fpLedBreath(FP_LED_BLUE);
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 20 — Emp ID Entry
  // ═══════════════════════════════════════════════════════
  if (page == SCR_EMP_ID_ENTRY) {
    if (menuFlow == MENU_IDLE) {
      uint16_t intent = readVP(0x1900);
      if (intent == 5) { clearVP(0x1900); menuFlow = MENU_PUNCHIN; }
      else if (intent == 6) { clearVP(0x1900); menuFlow = MENU_PUNCHOUT; }
      else if (intent == 7) { clearVP(0x1900); menuFlow = MENU_REGISTER; }
    }
    uint16_t okVal = readVP(0x5030);
    if (okVal == 0x0001) {
      clearVP(0x5030);
      delay(100);
      while (hmiSerial.available()) hmiSerial.read();
      String empId = readTextField(0x5020);
      empId.trim();
      Serial.printf("[MENU] EmpID Entry: '%s'\n", empId.c_str());

      if (empId.length() == 0) {
        showInvalidEmpId(); delay(2000); switchScreen(SCR_EMP_ID_ENTRY); return;
      }
      Employee* emp = findEmployeeById(empId);
      if (!emp) {
        Serial.println("[MENU] ID not found.");
        showInvalidEmpId(); delay(2000); switchScreen(SCR_EMP_ID_ENTRY);
      } else {
        menuEmpId   = emp->id;
        menuEmpName = emp->name;
        menuEmpPwd  = emp->password;
        switchScreen(SCR_PASSWORD_ENTRY);
      }
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 14 — Password Entry (Punch Out Flow)
  // ═══════════════════════════════════════════════════════
  if (page == SCR_PASSWORD_ENTRY) {
    uint16_t okVal = readVP(0x5040);
    if (okVal == 0x0001) {
      clearVP(0x5040);
      delay(100);
      while (hmiSerial.available()) hmiSerial.read();
      String password = readTextField(0x5000);
      password.trim();
      Serial.printf("[MENU] Password len: %d\n", password.length());

      if (password != menuEmpPwd) {
        Serial.println("[MENU] Wrong password.");
        showIncorrectPassword(); delay(2000); switchScreen(SCR_PASSWORD_ENTRY);
      } else {
        if (menuFlow == MENU_PUNCHIN) {
          Serial.println("[MENU] Password OK — Check In.");
          struct tm t; getTimeFromRTC(t);
          char date[11], timeFull[9];
          strftime(date,     sizeof(date),     "%Y-%m-%d", &t);
          strftime(timeFull, sizeof(timeFull), "%H:%M:%S", &t);

          fpLedOn(FP_LED_PURPLE);
          
          EmployeeState& state = employeeStates[menuEmpId];
          PunchType manualPunch = resolvePunch(state, String(timeFull).substring(0, 5));
          
          bool ok = false;
          if (manualPunch == PUNCH_ONDUTY_RETURN) {
            ok = sendReturn(menuEmpId, menuEmpName, String(date), String(timeFull));
          } else {
            ok = sendCheckIn(menuEmpId, menuEmpName, String(date), String(timeFull));
          }

          fpLedBlink(ok ? FP_LED_GREEN : FP_LED_RED, 3);
          
          if (ok) {
            goToCheckinSuccess(String(date), String(timeFull), menuEmpName);
          } else {
            switchScreen(SCR_POWER_ON);
          }
          fpLedBreath(FP_LED_BLUE);
          menuFlow = MENU_IDLE; // Reset flow
        } else if (menuFlow == MENU_PUNCHOUT) {
          Serial.println("[MENU] Password OK — go to Exit Purpose.");
          switchScreen(SCR_EXIT_PURPOSE);
          menuFlow = MENU_IDLE; // Reset flow
        } else if (menuFlow == MENU_REGISTER) {
          Serial.println("[MENU] Password OK — go to Fingerprint Registration.");
          regSlot = findNextFreeSlot();
          if (regSlot == -1) {
            Serial.println("[REG] Error: Sensor full!");
            switchScreen(SCREEN_POWER_ON);
            menuFlow = MENU_IDLE;
          } else {
            Serial.printf("[REG] Assigned Slot %d\n", regSlot);
            switchScreen(SCR_REG_FINGER_1);
          }
        }
      }
    }
    delay(100);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 16 & 10 — Fingerprint Registration State Machine
  // ═══════════════════════════════════════════════════════
  if (page == SCR_REG_FINGER_1) {
    if (finger.getImage() == FINGERPRINT_OK) {
      if (finger.image2Tz(1) == FINGERPRINT_OK) {
        fpLedBlink(FP_LED_PURPLE, 1);
        Serial.println("[REG] Scan 1 OK. Wait for removal.");
        while (finger.getImage() != FINGERPRINT_NOFINGER) delay(100);
        switchScreen(SCR_REG_FINGER_2);
      } else {
        fpLedBlink(FP_LED_RED, 2);
      }
    }
  }

  if (page == SCR_REG_FINGER_2) {
    if (finger.getImage() == FINGERPRINT_OK) {
      if (finger.image2Tz(2) == FINGERPRINT_OK) {
        if (finger.createModel() == FINGERPRINT_OK) {
          if (finger.storeModel(regSlot) == FINGERPRINT_OK) {
            fpLedBlink(FP_LED_GREEN, 2);
            Serial.println("[REG] Fingerprint Enrolled! Syncing to Sheets...");
            bool ok = sendRegisterFingerprint(menuEmpId, String(regSlot));
            if (ok) {
              syncEmployeesFromSheet();
              switchScreen(SCR_REG_SUCCESS);
            } else {
              deleteFingerprint(regSlot);
              switchScreen(SCREEN_POWER_ON);
            }
          } else {
            fpLedBlink(FP_LED_RED, 2);
            switchScreen(SCREEN_POWER_ON);
          }
        } else {
          Serial.println("[REG] Prints did not match.");
          fpLedBlink(FP_LED_RED, 2);
          switchScreen(SCREEN_POWER_ON);
        }
        menuFlow = MENU_IDLE;
        regSlot = -1;
      } else {
        fpLedBlink(FP_LED_RED, 2);
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // PAGE 17 — Employee Statistics Fingerprint Scan
  // ═══════════════════════════════════════════════════════
  if (page == SCR_STATS_SCAN) {
    int slotId = verifyFingerprint();
    if (slotId > 0 && millis() - lastPunchMillis > PUNCH_DEBOUNCE_MS) {
      lastPunchMillis = millis();
      Employee* emp = findEmployeeByFpSlot(slotId);
      if (emp) {
        Serial.printf("[STATS] FP Matched! Slot %d -> %s\n", slotId, emp->name.c_str());
        fpLedBlink(FP_LED_GREEN, 2);
        showEmployeeStats(emp);
      } else {
        Serial.println("[STATS] Unrecognized Fingerprint.");
        fpLedBlink(FP_LED_RED, 2);
        showFpNotRecognized();
      }
    } else if (slotId == 0) {
      fpLedBlink(FP_LED_RED, 2);
      showFpNotRecognized();
    }
  }

  delay(50);
}