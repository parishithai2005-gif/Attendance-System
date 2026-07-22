# Google Sheets Database & API Setup Guide

This guide details how to set up your Google Sheet database and connect the SparkDNA website to Google Sheets using Google Apps Script.

---

## Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com).
2. Create a new blank spreadsheet.
3. Rename the spreadsheet to **SparkDNA Database**.
4. (Optional) You do not need to create sheets or headers manually. The Apps Script code is programmed to check if the required sheets exist and will automatically generate the tables and columns on its first load.

---

## Step 2: Open Google Apps Script
1. Inside your new Google Sheet, click on **Extensions** in the top menu bar.
2. Select **Apps Script**.
3. A new editor window will open. Clear any code in the default `Code.gs` file.

---

## Step 3: Paste the Apps Script Code
1. Copy the code from the [Code.gs](file:///c:/Users/HP/OneDrive/Desktop/SparkDNA/google-apps-script/Code.gs) file in this repository.
2. Paste it directly into the `Code.gs` editor in Apps Script.
3. Click the **Save** icon (floppy disk) or press `Ctrl + S`.

---

## Step 4: Deploy the Web App
1. In the top-right corner of the Apps Script editor, click the blue **Deploy** button.
2. Select **New deployment**.
3. Click the gear icon next to "Select type" and select **Web app**.
4. Configure the deployment details:
   - **Description**: SparkDNA API v2.0
   - **Execute as**: Me (`your-email@gmail.com`)
   - **Who has access**: **Anyone** *(This is critical so the website can communicate with the API without standard Google authentication headers)*.
5. Click **Deploy**.
6. Google will request you to **Authorize Access**. Click **Authorize access**, choose your account, click **Advanced** -> **Go to SparkDNA Database (unsafe)**, and select **Allow**.
7. Once successfully deployed, copy the **Web app URL**. It will look similar to this:
   `https://script.google.com/macros/s/AKfycbz.../exec`

---

## Step 5: Connect to the SparkDNA Website
1. Launch the SparkDNA website locally.
2. Navigate to the **Admin Login** in the navigation bar.
3. Log in with the default administrator credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
4. In the Admin dashboard, navigate to the **Google Sheet Sync** tab.
5. Paste the **Web app URL** you copied in Step 4 into the **Google Apps Script Web App URL** field.
6. Click **Save Configuration**.
7. The system will ping the Apps Script to verify the connection. When successful, the banner will change to **LIVE SHEET INTEGRATION CONNECTED** and all data modifications, punches, and calendar updates will sync live to your Google Sheet!

---

## Sheet Structures (Reference)

For reference, the script automatically manages these 8 sheets. **Do not modify the column headers.** The Apps Script reads and writes data by exact header name.

---

### 1. Admin Sheet
Stores administrator login credentials.

| username | password |
| --- | --- |
| admin | admin123 |

---

### 2. Record Sheet
Stores daily check-in aggregates for dashboard analytics.

| Date | Present | OnDuty | Absent |
| --- | --- | --- | --- |
| 2026-07-14 | 5 | 1 | 0 |

---

### 3. Employee Calendar Sheet
Stores individual calendars. It dynamically contains one column for each day of the year (`jan01` through `dec31`) to mark extra work/leave/compensation.

| Employee ID | Employee Name | jan01 | jan02 | ... | dec31 |
| --- | --- | --- | --- | --- | --- |
| EMP101 | Subhash Chandra | Normal | Normal | ... | Normal |

- *Day Status Options*: `Normal`, `Extra`, `Compensation`, `Leave`

---

### 4. Employee Details Sheet
Stores employee personal details.

| Employee ID | Fingerprint ID | Name | Date of Birth | Date of Joining | Address | Aadhar Number | Gender | Blood Group | Email | Phone | Password |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EMP101 | 1 | Subhash Chandra | 1990-05-14 | 2024-01-15 | 12, Gandhipuram, Coimbatore | 1234-5678-9012 | Male | O+ | subhash@sparkdna.com | +91 98765 43210 | user123 |

---

### 5. Attendance log Sheet
Stores raw biometric gate punches.

| Log ID | Employee ID | Name | Date | Punch In Time | Punch Out Time | Mode |
| --- | --- | --- | --- | --- | --- | --- |
| LOG_EMP101_20260714_WORKING | EMP101 | Subhash Chandra | 2026-07-14 | 08:45:00 | 17:35:00 | Working |

- *Mode Options*: `Working`, `Onduty`, `Permission`, `Lunch`, `Dayclose`

---

### 6. On duty Sheet
Stores approved/pending outdoor and client deployments.

| Request ID | Employee ID | Name | Date | Time | Reason | Status | Approved By |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REQ_849201 | EMP104 | Vikram Singh | 2026-07-14 | 09:00 | Site deployment at ABC Castings. | Approved | admin |

---

### 7. Working calendar Sheet
Stores the common academic/factory working calendar and shift times.

| Date | Is Working Day | Working Time |
| --- | --- | --- |
| 2026-07-14 | Yes | 09:00:00 |
| 2026-07-19 | No | -- |

---

### 8. Contacts Sheet
Stores customer inquiries submitted from the Contact form.

| Contact Person Name | Business Email | Mobile Number | Company Name | Employee Size | Product Required | Requirement Details |
| --- | --- | --- | --- | --- | --- | --- |
| Sanjay Verma | sanjay@vermaforgings.com | +91 98840 12345 | Verma Forgings Pvt Ltd | 51-150 | BioGate Pro | Looking for custom pricing and installation. |
