# Google Sheets Database Setup Guide - SparkDNA Attendance System

This guide outlines how to create, initialize, style, and deploy the Google Sheets database for the SparkDNA Attendance System. 

As a professional system administrator, you will use Google Apps Script to automate the spreadsheet setup and enforce that employee data must be entered manually before enrolling fingerprints on the ESP32.

---

## Step 1: Create a New Google Sheet
1. Open [Google Sheets](https://sheets.google.com).
2. Click **Blank spreadsheet** to create a new sheet.
3. Rename the spreadsheet to something descriptive, e.g., `SparkDNA Attendance Database`.

---

## Step 2: Add and Save the Apps Script
1. In the menu bar at the top of your sheet, click **Extensions** > **Apps Script**.
2. Delete any boilerplate code inside the editor (specifically, clear the default `myFunction()`).
3. Open [AppScript.gs](file:///c:/Users/HP/OneDrive/Desktop/SparkDNA/Attendence%20System%20-%20ESP32/Attendence%20System%20-%20ESP32/AppScript.gs) from this project, copy its entire contents, and paste it into the Apps Script editor.
4. Click the **Save** (floppy disk) icon at the top of the editor, or press `Ctrl + S`.

---

## Step 3: Run the Initialization Menu
To set up and format the sheets automatically without manual styling, you can use our built-in initializer:

1. **Reload** the Google Sheets browser tab. 
2. You will see a new custom menu appear in the Google Sheets toolbar called **SparkDNA Attendance**.
3. Click **SparkDNA Attendance** > **Initialize / Reset Sheets**.
4. A prompt will ask for authorization. Click **Continue**, select your Google Account, click **Advanced** (at the bottom), and choose **Go to Untitled project (unsafe)** (or the name of your script). Finally, click **Allow**.
5. Click **SparkDNA Attendance** > **Initialize / Reset Sheets again**.
6. The script will run in the background. Two styled sheets will automatically be created:
   * **`Sheet1 (Attendance Log)`**: Formatted with a light green header. Frozen top row.
   * **`Sheet2 (Employees)`**: Formatted with a light blue header. Frozen top row.
7. A pop-up alert will confirm: *"Google Sheets initialized successfully! You can now manually add employee records..."*

---

## Step 4: Deploy the Web App
For the ESP32 to communicate with Google Sheets, you must deploy this script as a web application:

1. In the Apps Script editor, click the **Deploy** button at the top right, then select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment settings:
   * **Description**: `SparkDNA Attendance API v2`
   * **Execute as**: `Me (your-email@gmail.com)`
   * **Who has access**: `Anyone` *(Note: This is required so the ESP32 can send requests without authentication).*
4. Click **Deploy**.
5. Once deployment completes, copy the **Web app URL** (it ends in `/exec`).
6. Paste this URL into [src/config.h](file:///c:/Users/HP/OneDrive/Desktop/SparkDNA/Attendence%20System%20-%20ESP32/Attendence%20System%20-%20ESP32/src/config.h) under the `APPS_SCRIPT_URL` macro:
   ```c
   #define APPS_SCRIPT_URL "https://script.google.com/macros/s/.../exec"
   ```

---

## Step 5: How to Manage the Database (Pre-Registration Flow)

With this version, **you must enter employee records in Google Sheets before registering their fingerprints**. The ESP32 will reject unrecognized employee IDs.

### 1. Adding an Employee
Navigate to **`Sheet2 (Employees)`** and enter the employee's details in a new row:
* **`employee_id`**: Set a unique ID (e.g., `EMP101`, `EMP102`).
* **`fingerprint_id`**: **Leave this blank!** The ESP32 will automatically write the correct fingerprint sensor slot ID here when they register.
* **`name`**: Enter the employee's full name (e.g., `Revanth`).
* **`department` / `designation` / `email` / `phone`**: Fill these in as needed.
* **`joining_date`**: Enter their start date.
* **`status`**: Set to `Active`.

### 2. Registering Fingerprint on ESP32
1. Power up the ESP32 and open the Serial Monitor.
2. Select **Option 1** (`Register Employee Fingerprint`).
3. Enter the employee's ID (e.g., `EMP101`).
4. The ESP32 checks Google Sheets:
   * If the ID is found in the sheet, the sensor will pulse **White** to begin scanning.
   * If the ID is **not** found in the sheet, the registration fails immediately and prints an error message.
5. Place the finger twice as prompted to register.
6. Once registered successfully, the ESP32 updates `Sheet2 (Employees)` by writing the fingerprint slot ID (e.g., `1`, `2`) into the `fingerprint_id` column of that employee's pre-existing row.

### 3. Verification & Punching
* Now the employee can punch in (Check IN) and out (Check OUT). 
* Their daily punch times and statuses will automatically be recorded under **`Sheet1 (Attendance Log)`**.
