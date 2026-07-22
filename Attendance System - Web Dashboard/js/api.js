/**
 * Spark Drives and Automations (SparkDNA) - API Client
 * File: js/api.js
 * 
 * Manages database calls in two modes:
 * 1. Google Sheets Mode (REST requests to deployed Google Apps Script)
 * 2. Local Storage Mode (Stateful local mock database)
 */

class SparkApi {
  constructor() {
    this.scriptUrlKey = 'sparkdna_apps_script_url';
    this._cache = new Map(); // Short-lived in-memory cache
    this.cacheTtlMs = 4000;  // 4 second TTL
  }

  // Get configured Google Apps Script Web App URL
  getScriptUrl() {
    return localStorage.getItem(this.scriptUrlKey) || null;
  }

  // Set the Google Apps Script Web App URL
  setScriptUrl(url) {
    this.clearCache();
    if (url) {
      localStorage.setItem(this.scriptUrlKey, url.trim());
    } else {
      localStorage.removeItem(this.scriptUrlKey);
    }
  }

  // Clear in-memory cache
  clearCache() {
    this._cache.clear();
  }

  // Check if we are connected to Google Sheets backend
  isConnectedToSheets() {
    return this.getScriptUrl() !== null;
  }

  /**
   * Helper for GET requests to Apps Script with short-lived cache
   */
  async _get(action, forceRefresh = false) {
    const url = this.getScriptUrl();
    if (!url) throw new Error('Apps Script URL is not configured.');
    
    const now = Date.now();
    if (!forceRefresh && this._cache.has(action)) {
      const cached = this._cache.get(action);
      if (now - cached.timestamp < this.cacheTtlMs) {
        return cached.data;
      }
    }

    const fullUrl = action.includes('=') ? `${url}?action=${action}` : `${url}?action=${action}`;
    const response = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`API GET request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    this._cache.set(action, { timestamp: Date.now(), data });
    return data;
  }

  /**
   * Helper for POST requests to Apps Script
   * Sends text/plain to bypass CORS preflight issues
   */
  async _post(action, data) {
    const url = this.getScriptUrl();
    if (!url) throw new Error('Apps Script URL is not configured.');
    
    this.clearCache(); // Invalidate cache on write operations

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({ action, data })
    });
    
    if (!response.ok) {
      throw new Error(`API POST request failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /* ------------------------------------------------------------- */
  /* LOCAL STORAGE MOCKED METHODS (Source of truth when offline/demo) */
  /* ------------------------------------------------------------- */

  _getLocal(key) {
    const data = localStorage.getItem(`sparkdna_${key}`);
    return data ? JSON.parse(data) : [];
  }

  _setLocal(key, val) {
    localStorage.setItem(`sparkdna_${key}`, JSON.stringify(val));
  }

  /* ------------------------------------------------------------- */
  /* SYSTEM TESTING & INITIAL SYNC */
  /* ------------------------------------------------------------- */

  // Ping Sheets API
  async testConnection(url) {
    try {
      const pingUrl = `${url}?action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      if (!response.ok) return false;
      const res = await response.json();
      return res.status === 'success';
    } catch (e) {
      console.error('Ping check error:', e);
      return false;
    }
  }

  // Push local storage database to Google Sheets (Migration tool)
  async pushLocalDataToSheets() {
    if (!this.isConnectedToSheets()) return { status: 'error', message: 'No Google Sheet connected.' };
    
    try {
      const admins = this._getLocal('admins');
      const records = this._getLocal('records');
      const employees = this._getLocal('employees');
      const empCalendars = this._getLocal('emp_calendars');
      const attendance = this._getLocal('attendance_logs');
      const onDuty = this._getLocal('onduty_requests');
      const workingCalendar = this._getLocal('working_calendar');
      const contacts = this._getLocal('contacts');

      for (const admin of admins) { await this._post('addAdmin', admin); }
      for (const rec of records) { await this._post('addRecord', rec); }
      for (const emp of employees) { await this._post('addEmployee', emp); }
      for (const cal of empCalendars) { await this._post('addEmployeeCalendarRow', cal); }
      for (const att of attendance) { await this._post('addAttendanceLog', att); }
      for (const od of onDuty) { await this._post('addOnDutyRequest', od); }
      for (const wc of workingCalendar) { await this._post('addWorkingCalendar', wc); }
      for (const c of contacts) { await this._post('addContact', c); }

      return { status: 'success', message: 'Database migrated! Synced all 8 tables to Google Sheets.' };
    } catch (err) {
      console.error('Migration failed:', err);
      return { status: 'error', message: err.message || err.toString() };
    }
  }

  /* ------------------------------------------------------------- */
  /* ADMIN ENDPOINTS */
  /* ------------------------------------------------------------- */

  async authenticateAdmin(username, password) {
    if (this.isConnectedToSheets()) {
      return await this._post('authenticateAdmin', { username, password });
    } else {
      const admins = this._getLocal('admins');
      const matched = admins.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
      if (matched) {
        return { status: 'success', user: { username: matched.username, role: 'admin' } };
      } else {
        return { status: 'error', message: 'Invalid admin username or password.' };
      }
    }
  }

  async registerAdmin(username, password) {
    if (this.isConnectedToSheets()) {
      return await this._post('registerAdmin', { username, password });
    } else {
      const admins = this._getLocal('admins');
      if (admins.some(a => a.username.toLowerCase() === username.toLowerCase())) {
        return { status: 'error', message: 'Admin username already exists.' };
      }
      admins.push({ username, password });
      this._setLocal('admins', admins);
      return { status: 'success', message: 'Admin registered successfully.' };
    }
  }

  async resetAdminPassword(username, newPassword) {
    if (this.isConnectedToSheets()) {
      return await this._post('resetAdminPassword', { username, newPassword });
    } else {
      const admins = this._getLocal('admins');
      const idx = admins.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
      if (idx === -1) {
        return { status: 'error', message: 'Username not found.' };
      }
      admins[idx].password = newPassword;
      this._setLocal('admins', admins);
      return { status: 'success', message: 'Admin password reset successfully.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* DASHBOARD ANALYTICS ENDPOINTS */
  /* ------------------------------------------------------------- */

  async getDashboardStats(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getDashboardStats', forceRefresh);
    } else {
      return null;
    }
  }

  async getEmployeeStats(empId, forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get(`getEmployeeStats&empId=${encodeURIComponent(empId)}`, forceRefresh);
    } else {
      return null;
    }
  }

  /* ------------------------------------------------------------- */
  /* RECORD ENDPOINTS (SHEET 2) */
  /* ------------------------------------------------------------- */

  async getRecordStats(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getRecordStats', forceRefresh);
    } else {
      return this._getLocal('records');
    }
  }

  async saveRecordStats(record) {
    if (this.isConnectedToSheets()) {
      return await this._post('saveRecordStats', record);
    } else {
      const records = this._getLocal('records');
      const idx = records.findIndex(r => r.Date === record.Date);
      if (idx !== -1) {
        records[idx] = record;
      } else {
        records.push(record);
      }
      this._setLocal('records', records);
      return { status: 'success', message: 'Record saved successfully.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* EMPLOYEE CALENDAR ENDPOINTS (SHEET 3) */
  /* ------------------------------------------------------------- */

  async getEmployeeCalendars(forceRefresh = false) {
    let calendars = [];
    if (this.isConnectedToSheets()) {
      calendars = await this._get('getEmployeeCalendars', forceRefresh);
    } else {
      return this._getLocal('emp_calendars') || [];
    }

    // Merge remote sheet rows with local storage overrides so polling never resets edits
    const localCal = this._getLocal('emp_calendars') || [];
    if (Array.isArray(calendars)) {
      calendars = calendars.map(remoteRow => {
        const match = localCal.find(l => String(l['Employee ID']) === String(remoteRow['Employee ID']));
        return match ? Object.assign({}, remoteRow, match) : remoteRow;
      });
      // Include any local calendar rows not yet present in remote
      localCal.forEach(localRow => {
        if (!calendars.some(c => String(c['Employee ID']) === String(localRow['Employee ID']))) {
          calendars.push(localRow);
        }
      });
    }
    return calendars;
  }

  async saveEmployeeCalendarRow(empId, calendarRow) {
    // Always update local storage cache so state is available immediately
    const calendars = this._getLocal('emp_calendars') || [];
    const idx = calendars.findIndex(c => String(c['Employee ID']) === String(empId));
    if (idx !== -1) {
      calendars[idx] = Object.assign({}, calendars[idx], calendarRow);
    } else {
      calendars.push(calendarRow);
    }
    this._setLocal('emp_calendars', calendars);
    this.clearCache();

    if (this.isConnectedToSheets()) {
      return await this._post('saveEmployeeCalendarRow', { empId, calendarRow });
    } else {
      return { status: 'success', message: 'Employee calendar updated.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* EMPLOYEE DETAILS ENDPOINTS (SHEET 4) */
  /* ------------------------------------------------------------- */

  async getEmployees(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getEmployees', forceRefresh);
    } else {
      return this._getLocal('employees');
    }
  }

  async addEmployee(employeeData) {
    if (this.isConnectedToSheets()) {
      return await this._post('addEmployee', employeeData);
    } else {
      const emps = this._getLocal('employees');
      if (emps.some(e => e['Employee ID'] === employeeData['Employee ID'])) {
        return { status: 'error', message: `Employee ID ${employeeData['Employee ID']} already exists.` };
      }
      
      emps.push(employeeData);
      this._setLocal('employees', emps);

      const calendars = this._getLocal('emp_calendars');
      const defaultCalendarRow = {
        'Employee ID': employeeData['Employee ID'],
        'Employee Name': employeeData['Name']
      };
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      months.forEach((m, mIdx) => {
        for (let d = 1; d <= daysInMonth[mIdx]; d++) {
          const colName = `${m}${String(d).padStart(2, '0')}`;
          defaultCalendarRow[colName] = 'Normal';
        }
      });
      calendars.push(defaultCalendarRow);
      this._setLocal('emp_calendars', calendars);
      
      return { status: 'success', message: 'Employee registered successfully.', employee: employeeData };
    }
  }

  async updateEmployee(employeeData) {
    if (this.isConnectedToSheets()) {
      return await this._post('updateEmployee', employeeData);
    } else {
      const emps = this._getLocal('employees');
      const idx = emps.findIndex(e => e['Employee ID'] === employeeData['Employee ID']);
      if (idx === -1) return { status: 'error', message: 'Employee not found.' };
      
      emps[idx] = Object.assign(emps[idx], employeeData);
      this._setLocal('employees', emps);

      const calendars = this._getLocal('emp_calendars');
      const calIdx = calendars.findIndex(c => c['Employee ID'] === employeeData['Employee ID']);
      if (calIdx !== -1) {
        calendars[calIdx]['Employee Name'] = employeeData['Name'];
        this._setLocal('emp_calendars', calendars);
      }

      return { status: 'success', message: 'Employee updated successfully.' };
    }
  }

  async deleteEmployee(employeeId) {
    if (this.isConnectedToSheets()) {
      return await this._post('deleteEmployee', { employee_id: employeeId });
    } else {
      let emps = this._getLocal('employees');
      emps = emps.filter(e => e['Employee ID'] !== employeeId);
      this._setLocal('employees', emps);
      
      let calendars = this._getLocal('emp_calendars');
      calendars = calendars.filter(c => c['Employee ID'] !== employeeId);
      this._setLocal('emp_calendars', calendars);
      
      return { status: 'success', message: 'Employee deleted.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* ATTENDANCE LOG ENDPOINTS (SHEET 5) */
  /* ------------------------------------------------------------- */

  async getAttendanceLogs(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getAttendanceLogs', forceRefresh);
    } else {
      return this._getLocal('attendance_logs');
    }
  }

  async punchAttendanceLog(punchData) {
    if (this.isConnectedToSheets()) {
      return await this._post('punchAttendanceLog', punchData);
    } else {
      const logs = this._getLocal('attendance_logs');
      const empId = punchData['Employee ID'];
      const dateStr = punchData['Date'];
      const mode = punchData['Mode'] || 'Working';
      
      const idx = logs.findIndex(l => l['Employee ID'] === empId && l['Date'] === dateStr && l['Mode'] === mode);
      
      if (idx !== -1) {
        const record = logs[idx];
        record['Punch Out Time'] = punchData['Punch Out Time'] || new Date().toTimeString().split(' ')[0];
        
        if (record['Punch In Time']) {
          const inParts = record['Punch In Time'].split(':').map(Number);
          const outParts = record['Punch Out Time'].split(':').map(Number);
          const inMs = (inParts[0] * 3600 + inParts[1] * 60 + (inParts[2] || 0)) * 1000;
          const outMs = (outParts[0] * 3600 + outParts[1] * 60 + (outParts[2] || 0)) * 1000;
          const hrs = (outMs - inMs) / (1000 * 60 * 60);
          record.hours_worked = parseFloat(Math.max(0, hrs).toFixed(2));
        } else {
          record.hours_worked = 0;
        }
        
        logs[idx] = record;
        this._setLocal('attendance_logs', logs);
        return { status: 'success', type: 'punch_out', data: record, message: 'Punch Out recorded successfully.' };
      } else {
        const logId = `LOG_${empId.replace(/[^A-Za-z0-9]/g, '')}_${dateStr.replace(/-/g, '')}_${mode.toUpperCase()}`;
        const newRecord = {
          'Log ID': logId,
          'Employee ID': empId,
          'Name': punchData['Name'] || 'Employee',
          'Date': dateStr,
          'Punch In Time': punchData['Punch In Time'] || new Date().toTimeString().split(' ')[0],
          'Punch Out Time': '',
          'Mode': mode,
          'hours_worked': 0
        };
        logs.push(newRecord);
        this._setLocal('attendance_logs', logs);
        return { status: 'success', type: 'punch_in', data: newRecord, message: 'Punch In recorded successfully.' };
      }
    }
  }

  /* ------------------------------------------------------------- */
  /* ON-DUTY ENDPOINTS (SHEET 6) */
  /* ------------------------------------------------------------- */

  async getOnDutyRequests(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getOnDutyRequests', forceRefresh);
    } else {
      return this._getLocal('onduty_requests');
    }
  }

  async submitOnDutyRequest(requestData) {
    if (this.isConnectedToSheets()) {
      return await this._post('submitOnDutyRequest', requestData);
    } else {
      const onDuty = this._getLocal('onduty_requests');
      const reqId = `REQ_${Math.floor(Math.random() * 1000000)}`;
      const newRequest = {
        'Request ID': reqId,
        'Employee ID': requestData['Employee ID'],
        'Name': requestData['Name'],
        'Date': requestData['Date'],
        'Time': requestData['Time'] || '09:00',
        'Reason': requestData['Reason'],
        'Status': requestData['Status'] || 'Pending',
        'Approved By': requestData['Approved By'] || ''
      };
      
      onDuty.push(newRequest);
      this._setLocal('onduty_requests', onDuty);

      if (newRequest['Status'] === 'Approved') {
        await this.punchAttendanceLog({
          'Employee ID': newRequest['Employee ID'],
          'Name': newRequest['Name'],
          'Date': newRequest['Date'],
          'Punch In Time': newRequest['Time'] + ':00',
          'Punch Out Time': '17:30:00',
          'Mode': 'Onduty'
        });
      }

      return { status: 'success', data: newRequest, message: 'On-duty request logged successfully.' };
    }
  }

  async updateOnDutyStatus(requestId, status, approvedBy) {
    if (this.isConnectedToSheets()) {
      return await this._post('updateOnDutyStatus', { request_id: requestId, status, approved_by: approvedBy });
    } else {
      const onDuty = this._getLocal('onduty_requests');
      const idx = onDuty.findIndex(r => r['Request ID'] === requestId);
      if (idx === -1) return { status: 'error', message: 'On-duty request not found.' };
      
      onDuty[idx]['Status'] = status;
      onDuty[idx]['Approved By'] = approvedBy;
      this._setLocal('onduty_requests', onDuty);
      
      if (status === 'Approved') {
        const req = onDuty[idx];
        await this.punchAttendanceLog({
          'Employee ID': req['Employee ID'],
          'Name': req['Name'],
          'Date': req['Date'],
          'Punch In Time': req['Time'] + ':00',
          'Punch Out Time': '17:30:00',
          'Mode': 'Onduty'
        });
      }
      
      return { status: 'success', message: `Request status updated to ${status}.` };
    }
  }

  async deleteOnDutyRequest(requestId) {
    if (this.isConnectedToSheets()) {
      return await this._post('deleteOnDutyRequest', { request_id: requestId });
    } else {
      let onDuty = this._getLocal('onduty_requests');
      onDuty = onDuty.filter(r => r['Request ID'] !== requestId);
      this._setLocal('onduty_requests', onDuty);
      return { status: 'success', message: 'On-duty request deleted.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* WORKING CALENDAR ENDPOINTS (SHEET 7) */
  /* ------------------------------------------------------------- */

  async getWorkingCalendar(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getWorkingCalendar', forceRefresh);
    } else {
      return this._getLocal('working_calendar');
    }
  }

  async saveWorkingCalendar(calendarData) {
    if (this.isConnectedToSheets()) {
      return await this._post('saveWorkingCalendar', calendarData);
    } else {
      const calendar = this._getLocal('working_calendar');
      const idx = calendar.findIndex(c => c['Date'] === calendarData['Date']);
      if (idx !== -1) {
        calendar[idx] = Object.assign(calendar[idx], calendarData);
      } else {
        calendar.push(calendarData);
      }
      this._setLocal('working_calendar', calendar);
      return { status: 'success', message: 'Working calendar updated.' };
    }
  }

  /* ------------------------------------------------------------- */
  /* CONTACTS ENDPOINTS (SHEET 8) */
  /* ------------------------------------------------------------- */

  async getContacts(forceRefresh = false) {
    if (this.isConnectedToSheets()) {
      return await this._get('getContacts', forceRefresh);
    } else {
      return this._getLocal('contacts');
    }
  }

  async submitContactInquiry(contactData) {
    if (this.isConnectedToSheets()) {
      return await this._post('submitContactInquiry', contactData);
    } else {
      const contacts = this._getLocal('contacts');
      contacts.push(contactData);
      this._setLocal('contacts', contacts);
      return { status: 'success', message: 'Inquiry submitted successfully.' };
    }
  }

  // Auto-reload all database tables from Google Sheets
  async reloadAllFromSheets() {
    if (!this.isConnectedToSheets()) return false;
    this.clearCache();
    await Promise.all([
      this.getEmployees(true),
      this.getEmployeeCalendars(true),
      this.getAttendanceLogs(true),
      this.getWorkingCalendar(true),
      this.getRecordStats(true),
      this.getOnDutyRequests(true)
    ]);
    return true;
  }
}

// Export single shared instance
const api = new SparkApi();
window.sparkApi = api;
