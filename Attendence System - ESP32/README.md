# 🚀 SparkDNA ESP32 Fingerprint Attendance System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-ESP32-green.svg)
![Framework](https://img.shields.io/badge/framework-Arduino-orange.svg)

> A robust, ESP32-based biometric attendance logger paired with a Grow R503 fingerprint sensor and Google Sheets for serverless cloud data management.

This repository contains the firmware for the ESP32 fingerprint attendance system. It uses **Google Sheets** as a database (through a Google Apps Script Web App), providing a reliable and easy-to-manage state machine for tracking daily punches, breaks, and working hours.

## 🌟 Features
- **Biometric Authentication:** Uses the highly accurate Grow R503 capacitive fingerprint sensor.
- **Serverless Cloud Storage:** Directly logs attendance data to Google Sheets—no dedicated server required.
- **Smart Session Management:** Automatically handles check-ins, check-outs, and multi-state modes (`Working`, `On Duty`, `Permission`, `Break`).
- **Interactive LED Feedback:** Built-in RGB ring on the R503 sensor provides intuitive status updates (Idle, Scanning, Success, Error).
- **Easy Web Management:** Includes an Apps Script menu to quickly initialize and format the remote database.

---

## 🛠️ Hardware Requirements
- **ESP32 Development Board**
- **Grow R503 Fingerprint Sensor** (or a compatible serial fingerprint module)
- Jumper wires & power supply

---

## 📦 Software Dependencies
This project is built using [PlatformIO](https://platformio.org/). The following libraries are automatically managed via `platformio.ini`:
- `adafruit/Adafruit Fingerprint Sensor Library` (v2.1.0+)
- `bblanchon/ArduinoJson` (v7.0.0+)

---

## 🔌 Hardware Wiring (Grow R503 to ESP32)

Configure these pins inside `src/config.h`:

| Sensor Pin | ESP32 Pin | Description |
| :--- | :--- | :--- |
| **VCC/V+** | `3.3V` | Power Supply |
| **GND** | `GND` | Ground |
| **TX** | `GPIO 14` | Connects to ESP32 RX |
| **RX** | `GPIO 27` | Connects to ESP32 TX |

---

## ☁️ 1. Google Sheets & Apps Script Setup

1. **Create the Database Structure:**
   - Create a Google Sheet. It will act as your database.
   - For detailed step-by-step instructions on setting up and initializing the database, see the [Google Sheet Setup Guide](google_sheet_setup.md).

2. **Deploy the Web App:**
   - Click **Extensions** > **Apps Script**.
   - Replace all default code with the contents of [`AppScript.gs`](AppScript.gs).
   - Click **Save** (the floppy disk icon). Reload the Google Sheets browser tab to see the new **SparkDNA Attendance** menu.
   - Click **SparkDNA Attendance** > **Initialize / Reset Sheets** to automatically create and style the required sheets (`Sheet1` and `Sheet2`).
   - In the Apps Script editor, click **Deploy** > **New deployment**.
   - Select configuration type: **Web app**.
   - Set **Execute as:** `Me` and **Who has access:** `Anyone`.
   - Click **Deploy** and authorize the script.
   - Copy the provided **Web App URL**.

3. **Configure ESP32 Firmware:**
   - Open `src/config.h` in your project.
   - Update `#define APPS_SCRIPT_URL` with the copied URL.

### Sheet Overviews
- **Sheet1 (Attendance Log):** Logs daily punches, break times, and status switches (`empID`, `date`, `in_time`, `out_time`, `mode`).
- **Sheet2 (Employees):** Stores employee mapping metadata. **Important:** Employees must be added here manually *before* enrolling their fingerprints on the ESP32.

---

## 🚀 2. How to Operate

Connect the ESP32 to your PC, open the Serial Monitor (Baud rate `115200`), and use the following menu options:

### ☝️ Option 1: Register Fingerprint
1. Type `1` in the Serial Monitor.
2. Enter the Employee ID when prompted (e.g., `EMP005`). *(Note: The ID must already exist in `Sheet2`.)*
3. Place your finger on the sensor. The sensor LED will pulse **White**.
4. Remove your finger when prompted, then place it again to confirm.
5. The ESP32 maps the enrolled fingerprint to the Employee ID in `Sheet2`.

### 🟢 Option 2: Check IN (Login)
1. Type `2` in the Serial Monitor.
2. The sensor LED will pulse **Cyan** waiting for a finger.
3. Place an enrolled finger on the sensor.
4. Logs a `"Working"` entry in `Sheet1`. Closes any previous open sessions automatically.

### 🔴 Option 3: Check OUT (Logout)
1. Type `3` in the Serial Monitor.
2. Select checkout mode: `1` (**On Duty**), `2` (**Permission**), `3` (**Break**), or `4` (**Exit**).
3. The sensor LED will pulse **Cyan**.
4. Place an enrolled finger.
5. Closes the active session. If Mode 1, 2, or 3 is chosen, a new respective session begins.

*(Note: Type `c` in the Serial Monitor at any time to cancel the scanning wait).*

---

## 🚥 3. LED Status Indicator Chart

| LED State | Meaning |
| :--- | :--- |
| 🔵 **Bathing Blue** | Idle, waiting for menu choice. |
| 🟢 **Pulsing Cyan** | Waiting for finger placement during check in/out. |
| ⚪ **Solid White** | Fingerprint enrollment/registration mode. |
| 🟣 **Solid Purple** | Exchanging HTTP data with Google Sheets. |
| 🟩 **Flashed Green (3x)** | Operation successful. |
| 🟥 **Flashed Red (3x)** | Operation failed or finger unrecognized. |
| 🟨 **Flashed Yellow (3x)**| Fingerprint matches sensor memory, but no employee ID is mapped to it. |

---

<div align="center">
  <i>Developed for Spark DNA Attendance System</i>
</div>
