//config.h

#pragma once

// ─── WiFi ────────────────────────────────────────────────
#define WIFI_SSID "Venki"
#define WIFI_PASSWORD "Venki@25"

// ─── Google Apps Script ──────────────────────────────────
#define APPS_SCRIPT_URL                                                        \
  "https://script.google.com/macros/s/AKfycbyg0JmEyHKJz9tcbt9HabAq-tam7asOtZwUKVNiOi4KbEOTTLaO0YAJHOsLU1XU74P5/exec"
#define APPS_SCRIPT_GET_URL APPS_SCRIPT_URL "?action=getEmployeesESP32"

// ─── Fingerprint Sensor (GROW R503) ──────────────────────
#define FP_RX_PIN 14
#define FP_TX_PIN 27
#define FP_BAUD 57600

// ─── DWIN HMI (UART2 on ESP32) ────────────────────────────
#define HMI_RX_PIN 16
#define HMI_TX_PIN 17
#define HMI_BAUD 115200

// ─── DWIN Screen IDs (from TouchConfig project) ──────────
#define SCR_POWER_ON 0
#define SCR_DASHBOARD 1
#define SCR_FP_SCAN 2 // Reused for exit purpose? Wait, user says image 2 is exit purpose
#define SCR_EXIT_PURPOSE 2
#define SCR_CONFIRM_DAYCLOSE 3
#define SCR_CONFIRM_ONDUTY 4
#define SCR_CONFIRM_PERMISSION 5
#define SCR_CONFIRM_LUNCH 6
#define SCR_PUNCHOUT_SUCCESS 7
#define SCR_CHECKIN_SUCCESS 1
#define SCR_FP_NOT_RECOGNIZED 15
#define SCR_MENU_OPTIONS 8
#define SCR_EMPLOYEE_STATS 11
#define SCR_STATS_SCAN 17
#define SCR_REG_FINGER_1 16
#define SCR_REG_FINGER_2 10
#define SCR_REG_SUCCESS 12
#define SCR_EMP_ID_ENTRY 20
#define SCR_PASSWORD_ENTRY 14
#define SCR_INVALID_ID 18
#define SCR_WRONG_PASSWORD 19
#define SCR_KEYBOARD 30

// ─── DWIN VP Addresses (CONFIRM against your .DWP project!) ─
// Check-in success screen (1)
#define VP_CHECKIN_NAME 0x6020 // text VP, employee name
#define VP_CHECKIN_TIME 0x6040 // text VP, punch time
#define VP_CHECKIN_DATE 0x6060 // text VP, punch date

// Punch Out success screen (7)
#define VP_PUNCHOUT_DATE 0x7000
#define VP_PUNCHOUT_TIME 0x6080

// Employee Password entry
#define VP_PASSWORD_INPUT 0x5000 // text input

// Employee ID entry (14)
#define VP_EMP_ID_INPUT 0x5020 // text input

// Employee ID Submit Button (OK button on ID screen)
#define VP_EMP_ID_SUBMIT 0x5030 // Return Key Code VP

// Manual Punch Submit Button (OK button on Password screen)
#define VP_PUNCH_SUBMIT 0x5040 // Return Key Code VP

// Employee stats (11)
#define VP_STAT_NAME            0x2000
#define VP_STAT_PRESENT_DAYS    0x2020
#define VP_STAT_ABSENT_DAYS     0x2040
#define VP_STAT_WORK_HRS_PCT    0x2060
#define VP_STAT_AVG_WORK_HRS    0x2080
#define VP_STAT_ONTIME_ENTRY_PCT 0x3000
#define VP_STAT_AVG_ENTRY_TIME  0x3020
#define VP_STAT_ONTIME_EXIT_PCT 0x3040
#define VP_STAT_AVG_EXIT_TIME   0x3060

// Power on / dashboard (0/1)
#define VP_HOME_DATE 0x1000
#define VP_HOME_TIME 0x1020

// Dashboard Stats VPs (ASCII Text VPs)
#define VP_DASH_NUM_EMP        0x3080 // text VP
#define VP_DASH_MONTH_PRESENT  0x4000 // text VP
#define VP_DASH_MONTH_HOURS    0x4020 // text VP
#define VP_DASH_PRESENT_TODAY  0x4040 // text VP
#define VP_DASH_MONTH_ON_ENTRY 0x4060 // text VP
#define VP_DASH_MONTH_ON_EXIT  0x4080 // text VP

// ─── Attendance Rules ────────────────────────────────────
#define SHIFT_START_HOUR 9
#define SHIFT_START_MINUTE 30
#define LATE_GRACE_MINUTES 0

// ─── Timing ──────────────────────────────────────────────
#define NTP_SERVER "time.google.com"
#define GMT_OFFSET_SEC 19800
#define DAYLIGHT_OFFSET 0

#define PUNCH_DEBOUNCE_MS 3000
#define EMPLOYEE_SYNC_INTERVAL 1800000UL // 30 min, resync from sheet