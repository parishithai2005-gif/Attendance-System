# SparkDNA ESP32 Fingerprint Attendance System & Web Dashboard

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-ESP32%20%7C%20Web-blue)
![Database](https://img.shields.io/badge/Database-Google%20Sheets-success)

A complete, end-to-end Biometric Attendance System using an ESP32 microcontroller, FPM10A/R307 Fingerprint Sensor, Google Sheets as the database, and a real-time Web Dashboard. 

---

## 🌟 Features

- **Biometric Authentication**: Secure and fast fingerprint scanning using FPM10A/R307.
- **Cloud Database**: Cost-effective, accessible data storage using Google Sheets.
- **Real-time Web Dashboard**: Live polling updates attendance logs, employee directory, and daily statistics instantly.
- **Hardware Simulator**: Test the system directly from the web dashboard without the physical hardware.
- **Multiple Punch Modes**: Supports Working, Lunch, Permission, On Duty, and Day Close.

---

## 🏗 Architecture Overview

```text
 [ ESP32 + Fingerprint Sensor ]
             │
   (HTTP POST via WiFi)
             ▼
   [ Google Apps Script API ]
             │
             ▼
    [ Google Sheets DB ]  ◄── (CORS REST GET / POST with 10s Live Polling)
             ▲
             │ 
             ▼
   [ SparkDNA Web Dashboard ]
```

---

## 🛠 Hardware Requirements

- **ESP32 Development Board**
- **Fingerprint Sensor**: FPM10A / R307 (or compatible)
- Jumper Wires
- Breadboard / Custom PCB
- Power Supply (5V/3.3V)

### Wiring Guide

| Fingerprint Sensor Pin | ESP32 Pin |
|------------------------|-----------|
| VCC (Red)              | 3.3V / 5V |
| GND (Black)            | GND       |
| TX (Yellow/Green)      | RX2 (GPIO 16) |
| RX (White)             | TX2 (GPIO 17) |

---

## 🚀 Step-by-Step Setup Guide

### 1. Google Sheets Database & API Setup
1. Create a new Google Sheet and rename it.
2. Go to **Extensions > Apps Script**.
3. Replace the default code with the contents of `google-apps-script/Code.gs` (or `AppScript.gs`).
4. Save the project.
5. Click **Deploy > New deployment**:
   - **Type**: Web App
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy** and copy the generated **Web App URL**.

### 2. ESP32 Hardware Configuration
1. Open the ESP32 project in Arduino IDE or PlatformIO.
2. Install the necessary libraries (`Adafruit Fingerprint Sensor Library`, `WiFi`, `HTTPClient`).
3. Update `src/config.h` (or your main `.ino` file) with your WiFi credentials and the Web App URL:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   String APPS_SCRIPT_URL = "YOUR_WEB_APP_URL";
   ```
4. Flash the code to your ESP32.

### 3. Web Dashboard Configuration
1. Open the `index.html` file of the web dashboard in your browser.
2. Navigate to the **Admin Portal** and log in (Default: `admin` / `admin123`).
3. Go to the **Google Sheet Sync** settings.
4. Paste the **Web App URL** copied from Step 1 and click **Save Configuration**.
5. The dashboard will now display `LIVE SHEET INTEGRATION CONNECTED` and start polling data every 10 seconds.

---

## 💻 Usage & Testing

### Option A: Testing with Physical ESP32
1. Power on the ESP32 and ensure it connects to WiFi.
2. Scan a registered fingerprint on the sensor.
3. Open the Serial Monitor to verify the HTTP POST response.
4. Open the Web Dashboard — the new punch log will appear automatically within 10 seconds.

### Option B: Built-In Web Simulator
1. Go to the **Attendance Logs** tab in the Admin Portal.
2. Use the **Spark Bio-Gate Pro** terminal simulator on the right.
3. Select an employee and a punch mode.
4. Click **Scan Finger** to simulate a physical scan and instantly update the records.

---

## 🐛 Troubleshooting

| Problem | Cause | Solution |
| --- | --- | --- |
| Website shows "RUNNING IN SIMULATED LOCAL DEMO MODE" | Web App URL is not saved | Go to `Admin > Google Sheet Sync`, paste URL, and click Save. |
| Time shows as `1899-12-30` or `--` | Outdated Apps Script code | Ensure you have deployed a **New Version** of the latest `Code.gs`. |
| ESP32 HTTP error / 302 redirect failed | Incorrect App Script permissions | Set deployment "Who has access" to **Anyone**. |
| Attendance counts not updating | ID Mismatch | Ensure the ESP32 logged ID matches the Employee ID in the Sheets database. |

---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
