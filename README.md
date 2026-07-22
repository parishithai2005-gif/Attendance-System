# SparkDNA Biometric Attendance System

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-ESP32%20%7C%20Web%20%7C%20HMI-blue)
![Database](https://img.shields.io/badge/Database-Google%20Sheets-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Framework](https://img.shields.io/badge/Framework-Arduino%20%2F%20PlatformIO-orange)

A complete, end-to-end **Biometric Attendance System** built on the ESP32 microcontroller platform, integrating a capacitive fingerprint sensor, a local HMI display, a Google Sheets cloud database, and a real-time web dashboard — all without a dedicated backend server.

> 🔗 **Live Web Dashboard:** [https://sparkdna-website.vercel.app](https://sparkdna-website.vercel.app)
>
> 📊 **Google Sheet Database:** [Open Sheet](https://docs.google.com/spreadsheets/d/13YQNUDe_YMD-kbHrHEo6SOK3wnxMhvxBECyF9Db1wYo/edit?gid=1885641701#gid=1885641701)
>
> ⚙️ **Google Apps Script API:** [Web App URL](https://script.google.com/macros/s/AKfycbyg0JmEyHKJz9tcbt9HabAq-tam7asOtZwUKVNiOi4KbEOTTLaO0YAJHOsLU1XU74P5/exec)

---

## 📁 Repository Structure

```
SparkDNA-Attendance-System/
│
├── Attendence System - ESP32/        # ESP32 firmware (PlatformIO)
│   ├── src/
│   │   ├── main.cpp                  # Core state machine & fingerprint logic
│   │   └── config.h                  # WiFi credentials, URLs, pin definitions
│   ├── AppScript.gs                  # Google Apps Script backend (deploy as Web App)
│   ├── platformio.ini                # PlatformIO project config & library dependencies
│   └── README.md
│
├── Attendance System - Web Dashboard/  # Real-time web admin portal
│   ├── index.html                    # Main dashboard entry point
│   ├── google-apps-script/
│   │   └── Code.gs                   # Apps Script for web dashboard API
│   └── README.md
│
├── Attendance System - HMI display/    # Local display interface for the ESP32 unit
│
└── README.md                           ← You are here
```

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| **Biometric Auth** | Fast, secure fingerprint identification using Grow R503 / FPM10A / R307 sensors |
| **Serverless Cloud** | Google Sheets acts as a zero-cost, accessible database via Apps Script |
| **Real-time Dashboard** | Live web admin portal with 10-second polling for instant updates |
| **HMI Display** | Local on-device display for status and feedback without opening a browser |
| **Multi-Punch Modes** | Working, On Duty, Permission, Break, and Day Close modes |
| **LED Feedback** | RGB ring on R503 gives intuitive color-coded status during all operations |
| **Web Simulator** | Built-in hardware simulator in the dashboard — test without physical ESP32 |
| **Smart Sessions** | Automatically closes previous open sessions on a new check-in |

---

## 🏗️ System Architecture

```
  ┌─────────────────────────────┐
  │   ESP32 + Fingerprint Sensor│
  │   + HMI Display             │
  └────────────┬────────────────┘
               │  HTTP POST (WiFi)
               ▼
  ┌─────────────────────────────┐
  │   Google Apps Script API    │  ◄── Deployed as a Web App
  └────────────┬────────────────┘
               │
               ▼
  ┌─────────────────────────────┐
  │   Google Sheets Database    │  ◄── Sheet1: Attendance Log
  │                             │      Sheet2: Employee Directory
  └────────────┬────────────────┘
               │  CORS REST (GET/POST) — 10s Live Polling
               ▼
  ┌─────────────────────────────┐
  │   SparkDNA Web Dashboard    │  ── sparkdna-website.vercel.app
  └─────────────────────────────┘
```

---

## 🛠️ Hardware Requirements

- **ESP32 Development Board**
- **Fingerprint Sensor** — Grow R503 (recommended) or FPM10A / R307
- HMI Display (see `Attendance System - HMI display/` folder)
- Jumper Wires & Breadboard / Custom PCB
- Power Supply (3.3V / 5V)

### Wiring Guide

#### Grow R503 → ESP32

| Sensor Pin | ESP32 Pin | Description |
|:---|:---|:---|
| VCC / V+ | `3.3V` | Power |
| GND | `GND` | Ground |
| TX | `GPIO 14` | Sensor TX → ESP32 RX |
| RX | `GPIO 27` | Sensor RX → ESP32 TX |

#### FPM10A / R307 → ESP32 (alternate sensors)

| Sensor Pin | ESP32 Pin |
|:---|:---|
| VCC (Red) | `3.3V / 5V` |
| GND (Black) | `GND` |
| TX (Yellow/Green) | `RX2 — GPIO 16` |
| RX (White) | `TX2 — GPIO 17` |

---

## 🚀 Setup Guide

### Step 1 — Google Sheets & Apps Script

1. Open the [Google Sheet Database](https://docs.google.com/spreadsheets/d/13YQNUDe_YMD-kbHrHEo6SOK3wnxMhvxBECyF9Db1wYo/edit?gid=1885641701#gid=1885641701) (or create a fresh copy).
2. Go to **Extensions > Apps Script**.
3. Replace the default code with the contents of `AppScript.gs` from the ESP32 folder (or `Code.gs` from the Web Dashboard folder).
4. Save the project, then reload the Sheet tab — a **SparkDNA Attendance** menu will appear.
5. Click **SparkDNA Attendance > Initialize / Reset Sheets** to auto-create `Sheet1` (Attendance Log) and `Sheet2` (Employee Directory).
6. In the Apps Script editor: **Deploy > New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**, authorize, and copy the **Web App URL**.

> The current deployed Web App is live at:
> `https://script.google.com/macros/s/AKfycbyg0JmEyHKJz9tcbt9HabAq-tam7asOtZwUKVNiOi4KbEOTTLaO0YAJHOsLU1XU74P5/exec`

---

### Step 2 — ESP32 Firmware

1. Open the `Attendence System - ESP32/` folder in **PlatformIO** (VS Code recommended).
2. All library dependencies are declared in `platformio.ini` and auto-installed:
   - `adafruit/Adafruit Fingerprint Sensor Library` (v2.1.0+)
   - `bblanchon/ArduinoJson` (v7.0.0+)
3. Edit `src/config.h` with your network and API details:
   ```cpp
   const char* ssid     = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   #define APPS_SCRIPT_URL "YOUR_WEB_APP_URL"
   ```
4. Flash to the ESP32 (`PlatformIO: Upload`).
5. Open the Serial Monitor at **115200 baud** to interact with the menu.

---

### Step 3 — Web Dashboard

1. Open [https://sparkdna-website.vercel.app](https://sparkdna-website.vercel.app) (or open `index.html` locally).
2. Navigate to **Admin Portal** and log in:
   - Default credentials: `admin` / `admin123`
3. Go to **Google Sheet Sync** settings.
4. Paste the Web App URL from Step 1 and click **Save Configuration**.
5. The status will update to `LIVE SHEET INTEGRATION CONNECTED` and begin polling every 10 seconds.

---

## 💻 Operating the ESP32

Open the Serial Monitor (baud: `115200`) and use the numeric menu:

### Option 1 — Register Fingerprint
1. Type `1` and press Enter.
2. Enter the Employee ID when prompted (e.g., `EMP005`). *(Must already exist in Sheet2.)*
3. Place finger on sensor — LED pulses **White**.
4. Remove and re-place finger to confirm enrollment.

### Option 2 — Check IN (Login)
1. Type `2` and press Enter.
2. LED pulses **Cyan**, waiting for finger.
3. Place enrolled finger → logs a `"Working"` entry in Sheet1. Closes any previous open session.

### Option 3 — Check OUT (Logout)
1. Type `3` and press Enter.
2. Select checkout mode:
   - `1` → On Duty
   - `2` → Permission
   - `3` → Break
   - `4` → Exit (full check-out)
3. Place enrolled finger → closes active session. Modes 1–3 start a new session immediately.

> 💡 Type `c` at any time in the Serial Monitor to cancel a pending scan.

---

## 🚥 LED Status Reference (Grow R503)

| LED State | Meaning |
|:---|:---|
| 🔵 Bathing Blue | Idle — waiting for Serial menu input |
| 🟢 Pulsing Cyan | Waiting for finger during check-in / check-out |
| ⚪ Solid White | Fingerprint enrollment / registration mode |
| 🟣 Solid Purple | Communicating with Google Sheets (HTTP exchange) |
| 🟩 Flash Green × 3 | Operation successful |
| 🟥 Flash Red × 3 | Operation failed or finger not recognized |
| 🟨 Flash Yellow × 3 | Finger matched sensor memory, but no Employee ID is mapped |

---

## 📊 Google Sheets Database Schema

**Sheet1 — Attendance Log**

| Column | Description |
|---|---|
| `empID` | Employee identifier (e.g., EMP001) |
| `date` | Date of punch |
| `in_time` | Check-in timestamp |
| `out_time` | Check-out timestamp |
| `mode` | Session mode (Working / On Duty / Permission / Break) |

**Sheet2 — Employee Directory**

| Column | Description |
|---|---|
| `empID` | Unique employee identifier |
| `name` | Full name |
| `fingerprintID` | Sensor slot mapped after enrollment |

> ⚠️ Employees **must be added to Sheet2 manually** before their fingerprint can be enrolled on the ESP32.

---

## 🐛 Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| Dashboard shows `RUNNING IN SIMULATED LOCAL DEMO MODE` | Web App URL not saved | Admin > Google Sheet Sync → paste URL → Save |
| Date shows `1899-12-30` or `--` | Outdated Apps Script version | Re-deploy a **new version** of the latest `AppScript.gs` |
| ESP32 HTTP error / 302 redirect | Wrong deployment permissions | Set deployment **"Who has access"** to **Anyone** |
| Attendance counts not updating | Employee ID mismatch | Ensure ESP32-logged ID matches the ID in Sheet2 |
| Yellow LED flash on scan | Fingerprint enrolled but ID not mapped | Re-enroll the fingerprint using Option 1 and assign the correct EMP ID |

---

## 📦 Software Dependencies Summary

| Component | Dependencies |
|---|---|
| ESP32 Firmware | PlatformIO, `Adafruit Fingerprint Sensor Library`, `ArduinoJson` |
| Apps Script | Google Apps Script (no external libraries) |
| Web Dashboard | Vanilla HTML/CSS/JS — no build step required |

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Developed by Team SparkDNA</b><br/>
  PSG Institute of Technology and Applied Research, Coimbatore
</div>
