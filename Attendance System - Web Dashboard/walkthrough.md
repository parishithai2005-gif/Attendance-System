# Walkthrough - SparkDNA Website Final Version Fullstack Upgrade

We have successfully overhauled the **SparkDNA Website** and its Google Sheets / LocalStorage backend database into a premium, product-level SPA and portal system. Here is a summary of the accomplishments and implementation details.

---

## 1. Accomplishments & Refactor Summary

### A. SPA Shell & Clean Visual Brand
- **SparkDNA branding alignment**: Removed the text "SparkDNA" next to the logo image in both Header and Footer. The website now features only the clean logo image (`assets/images/logo.jpg`).
- **5-Section Landing Page**: Kept navigation strictly to Home, About, Products, FAQ, and Contact.
- **Removed Employee Portal**: Cleaned up the header button, footer portals, routing entries in `app.js`, and completely deleted the redundant `employee.js` page module.

### B. Secure Admin Login System
- Renamed the header navigation button to **Admin Login**.
- Integrated show/hide password visibility toggle (eye icon).
- Created **Sign Up** self-registration for new admins.
- Created **Forgot Password** self-reset.
- The administrator logins are mapped directly to Sheet 1 (`Admin`).

### C. 8-Sheet Database Architecture
Both the mock client database (`api.js` + `db-init.js`) and the Google Apps Script Web App (`Code.gs`) are re-engineered to support **8 interconnected sheets**:
1. **`Admin`**: `username | password`
2. **`Record`**: `Date | Present | OnDuty | Absent`
3. **`Employee Calendar`**: `Employee ID | Employee Name | jan01 | ... | dec31`
4. **`Employee Details`**: `Employee ID | Fingerprint ID | Name | Date of Birth | Date of Joining | Address | Aadhar Number | Gender | Blood Group | Email | Phone | Password`
5. **`Attendance log`**: `Log ID | Employee ID | Name | Date | Punch In Time | Punch Out Time | Mode`
6. **`On duty`**: `Request ID | Employee ID | Name | Date | Time | Reason | Status | Approved By`
7. **`Working calendar`**: `Date | Is Working Day | Working Time`
8. **`Contacts`**: `Contact Person Name | Business Email | Mobile Number | Company Name | Employee Size | Product Required | Requirement Details`

---

## 2. Admin Portal Features & Tabs

We built out 7 highly functional tabs inside the Admin Portal:

1. **Dashboard**:
   - Total active employee counter widget.
   - Today's statistics: Present, On-Duty, and Absent counts.
   - Weekly & Monthly attendance charts (using Chart.js) with **revert back pagination**. Previous Week/Month buttons allow administrators to query and view historical data groups seamlessly.
2. **Employee Directory**:
   - Roster table with live status tags: `working`, `onduty`, `permission`, `Lunch`, `dayclose`, `Leave`, `Late` (Late is determined by checking check-in time against the Working Time set in Sheet 7 for today).
   - "Add Employee" button asking for all 10 details.
   - **4 Actions**:
     - *Action 1 (Edit Details)*: View and modify personal fields (EMP ID and Fingerprint ID are locked/read-only).
     - *Action 2 (Working Calendar)*: Interactive monthly grid where clicking toggles days to mark extra work, leave, or compensation for that individual employee. Updates Sheet 3 (`Employee Calendar`).
     - *Action 3 (Attendance Percentage)*: Displays percentage cards for today, weekly, and monthly attendance based on logs and calendars.
     - *Action 4 (Delete)*: Deletes the employee.
3. **Attendance Log**:
   - Raw records table.
   - **Built-in Biometric IoT Gate Simulator**: Renders a monochrome LCD mockup screen and optical sensor button. Let's you select any employee, choose a mode (Working, Lunch, Permission, On-Duty, Day Close), and press scan. Features synthetic sound bleeps and logs punches in real-time.
4. **On Duty**:
   - Table of requests.
   - Log button to submit a request on behalf of any employee.
   - Approve / Reject / Delete controls.
5. **Time Setting**:
   - Form to manually set the official working time / shift start time and working status for any calendar date. Saves to Sheet 7.
6. **Calendar Setting**:
   - Monthly calendar grid (academic calendar style).
   - Clicking on any day toggles it between a Working Day (green) and a Leave/Holiday Day (red). Saves to Sheet 7.
7. **Google Sheet Sync**:
   - Enter Apps Script URL to sync database and migrate mock data.

---

## 3. How to Verify

1. **Start Local Server**: Run the project using a local server (e.g. Live Server or http-server).
2. **Branding & Navigation**: Check that the SparkDNA text is gone and only the logo displays.
3. **Log In / Sign Up**: Go to **Admin Login**, toggle the password visibility eye, test Sign Up with a new account, and test Forgot Password reset.
4. **Interact with Simulator**: Navigate to **Attendance Logs** tab, select an employee and mode, and scan. Verify that it logs the punch in the table immediately.
5. **Mark Schedules**: Check the directory actions (Calendar compensation marking, stats) and configure common holidays in Calendar Settings.
