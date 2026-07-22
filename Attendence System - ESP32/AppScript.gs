/**
 * Spark Drives and Automations (SparkDNA) - Google Sheets Backend API
 * File: Code.gs / AppScript.gs
 * 
 * Exposes a REST API via Google Apps Script Web App for both
 * ESP32 Biometric Hardware Terminals and the SparkDNA Web Application.
 */

// Runs automatically when the Google Sheet is opened
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SparkDNA Admin')
    .addItem('Initialize / Reload Sheets Database', 'initDatabase')
    .addToUi();
}

var SCHEMAS = {
  'Admin': ['username', 'password'],
  'Record': ['Date', 'Present', 'OnDuty', 'Absent', 'LateIn', 'LateOut'],
  'Employee Calendar': [], // Populated dynamically
  'Employee Details': ['Employee ID', 'Fingerprint ID', 'Name', 'Date of Birth', 'Date of Joining', 'Address', 'Aadhar Number', 'Gender', 'Blood Group', 'Email', 'Phone', 'Password'],
  'Attendance log': ['Log ID', 'Employee ID', 'Name', 'Date', 'Punch In Time', 'Punch Out Time', 'Mode'],
  'On duty': ['Request ID', 'Employee ID', 'Name', 'Date', 'Time', 'Reason', 'Status', 'Approved By'],
  'Working calendar': ['Date', 'Is Working Day', 'In Time', 'Out Time'],
  'Contacts': ['Contact Person Name', 'Business Email', 'Mobile Number', 'Company Name', 'Employee Size', 'Product Required', 'Requirement Details']
};

function doGet(e) {
  var action = e ? e.parameter.action : '';
  initDatabase();
  
  try {
    switch (action) {
      case 'getRecordStats': return jsonResponse(readTable('Record'));
      case 'getEmployeeCalendars': return jsonResponse(readTable('Employee Calendar'));
      case 'getEmployees': return jsonResponse(readTable('Employee Details'));
      case 'getEmployeesESP32': return getEmployeesForESP32();
      case 'getAttendanceLogs': return jsonResponse(readTable('Attendance log'));
      case 'getOnDutyRequests': return jsonResponse(readTable('On duty'));
      case 'getWorkingCalendar': return jsonResponse(readTable('Working calendar'));
      case 'getContacts': return jsonResponse(readTable('Contacts'));
      case 'getDashboardStats': return getDashboardStats();
      case 'getEmployeeStats': return getEmployeeStats(e ? e.parameter.empId : '');
      case 'ping': return jsonResponse({ status: 'success', message: 'SparkDNA Apps Script Connected successfully.' });
      default:
        if (!action || action === '') return jsonResponse({ status: 'success', message: 'ok' });
        return errorResponse('Invalid GET action: ' + action);
    }
  } catch (err) {
    return errorResponse(err.message || err.toString());
  }
}

function doPost(e) {
  initDatabase();
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var data = requestData.data;
    
    switch (action) {
      case 'authenticateAdmin': return authenticateAdmin(data.username, data.password);
      case 'registerAdmin': return registerAdmin(data.username, data.password);
      case 'resetAdminPassword': return resetAdminPassword(data.username, data.newPassword);
      case 'addAdmin': return addAdmin(data);
      case 'saveRecordStats': return saveRecordStats(data);
      case 'addRecord': return addRecord(data);
      case 'saveEmployeeCalendarRow': return saveEmployeeCalendarRow(data.empId, data.calendarRow);
      case 'addEmployeeCalendarRow': return addEmployeeCalendarRow(data);
      case 'addEmployee': return addEmployee(data);
      case 'updateEmployee': return updateEmployee(data);
      case 'deleteEmployee': return deleteEmployee(data.employee_id);
      case 'punchAttendanceLog': return punchAttendanceLog(data);
      case 'addAttendanceLog': return addAttendanceLog(data);
      case 'submitOnDutyRequest': return submitOnDutyRequest(data);
      case 'addOnDutyRequest': return addOnDutyRequest(data);
      case 'updateOnDutyStatus': return updateOnDutyStatus(data);
      case 'deleteOnDutyRequest': return deleteOnDutyRequest(data.request_id);
      case 'saveWorkingCalendar': return saveWorkingCalendar(data);
      case 'addWorkingCalendar': return addWorkingCalendar(data);
      case 'submitContactInquiry': return submitContactInquiry(data);
      case 'addContact': return addContact(data);
      default: return errorResponse('Invalid POST action: ' + action);
    }
  } catch (err) {
    return errorResponse(err.message || err.toString());
  }
}

// ── Database Initialization ───────────────────────────────────────────────
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var calendarHeaders = ['Employee ID', 'Employee Name'];
  for (var mIdx = 0; mIdx < months.length; mIdx++) {
    for (var d = 1; d <= daysInMonth[mIdx]; d++) {
      calendarHeaders.push(months[mIdx] + (d < 10 ? '0' + d : d));
    }
  }
  SCHEMAS['Employee Calendar'] = calendarHeaders;

  for (var tableName in SCHEMAS) {
    var sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
      sheet.appendRow(SCHEMAS[tableName]);
      if (tableName === 'Admin') sheet.appendRow(['admin', 'admin123']);
    } else {
      var lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        var headerRange = sheet.getRange(1, 1, 1, lastCol);
        var currentHeaders = headerRange.getValues()[0];
        var expectedHeaders = SCHEMAS[tableName];
        var isMatch = true;
        for (var k = 0; k < expectedHeaders.length; k++) {
          if (currentHeaders.indexOf(expectedHeaders[k]) === -1) { isMatch = false; break; }
        }
        if (!isMatch) {
          var newHeaderRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
          newHeaderRange.setValues([expectedHeaders]);
        }
      }
    }
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function errorResponse(msg) {
  return jsonResponse({ status: 'error', message: msg });
}

/**
 * Reads a table from Google Sheets.
 * Formats Time cells (Punch In Time, Punch Out Time, Time) as HH:mm:ss,
 * and Date cells (Date, Date of Birth, Date of Joining) as yyyy-MM-dd.
 */
function readTable(tableName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var rows = [];
  var tz = Session.getScriptTimeZone();

  for (var i = 1; i < values.length; i++) {
    var rowVal = values[i];
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = rowVal[j];
      if (val instanceof Date) {
        var hName = String(headers[j]);
        if (hName.indexOf('Time') !== -1) {
          val = Utilities.formatDate(val, tz, 'HH:mm:ss');
        } else {
          val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
        }
      } else if (val !== null && val !== undefined) {
        val = String(val).trim();
      } else {
        val = '';
      }
      rowObj[headers[j]] = val;
    }
    rows.push(rowObj);
  }
  return rows;
}

function appendToTable(tableName, obj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
  var headers = SCHEMAS[tableName];
  var rowData = [];
  for (var i = 0; i < headers.length; i++) {
    var val = obj[headers[i]];
    rowData.push(val !== undefined ? val : '');
  }
  sheet.appendRow(rowData);
  return { status: 'success', data: obj };
}

function updateTableRow(tableName, keyField, keyValue, updatedObj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
  if (!sheet) return { status: 'error', message: 'Sheet not found' };
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { status: 'error', message: 'Table is empty' };
  
  var headers = values[0];
  var keyColIdx = headers.indexOf(keyField);
  var tz = Session.getScriptTimeZone();
  
  if (keyColIdx === -1) throw new Error('Key field ' + keyField + ' not found');
  
  for (var i = 1; i < values.length; i++) {
    var val = values[i][keyColIdx];
    if (val instanceof Date) {
      if (String(keyField).indexOf('Time') !== -1) val = Utilities.formatDate(val, tz, 'HH:mm:ss');
      else val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
    }
    if (val.toString().trim() === keyValue.toString().trim()) {
      var rowNum = i + 1;
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (updatedObj[key] !== undefined) {
          sheet.getRange(rowNum, j + 1).setValue(updatedObj[key]);
        }
      }
      return { status: 'success', message: 'Row updated successfully.' };
    }
  }
  return { status: 'error', message: 'Row not found.' };
}

function deleteTableRow(tableName, keyField, keyValue) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName);
  if (!sheet) return { status: 'error', message: 'Sheet not found' };
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { status: 'error', message: 'Table is empty' };
  
  var headers = values[0];
  var keyColIdx = headers.indexOf(keyField);
  var tz = Session.getScriptTimeZone();
  
  if (keyColIdx === -1) throw new Error('Key field ' + keyField + ' not found');

  for (var i = 1; i < values.length; i++) {
    var val = values[i][keyColIdx];
    if (val instanceof Date) {
      if (String(keyField).indexOf('Time') !== -1) val = Utilities.formatDate(val, tz, 'HH:mm:ss');
      else val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
    }
    if (val.toString().trim() === keyValue.toString().trim()) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Row deleted.' };
    }
  }
  return { status: 'error', message: 'Row not found.' };
}

// ── User Management ───────────────────────────────────────────────────────
function authenticateAdmin(username, password) {
  var admins = readTable('Admin');
  for (var i = 0; i < admins.length; i++) {
    if (admins[i].username.toString().toLowerCase() === username.toString().toLowerCase() && 
        admins[i].password.toString() === password.toString()) {
      return jsonResponse({ status: 'success', user: { username: admins[i].username, role: 'admin' } });
    }
  }
  return jsonResponse({ status: 'error', message: 'Invalid admin username or password.' });
}
function registerAdmin(username, password) {
  appendToTable('Admin', { username: username, password: password });
  return jsonResponse({ status: 'success', message: 'Admin registered.' });
}
function resetAdminPassword(username, newPassword) { return jsonResponse(updateTableRow('Admin', 'username', username, { password: newPassword })); }
function addAdmin(adminData) { return jsonResponse(appendToTable('Admin', adminData)); }

function saveRecordStats(record) { 
  var dateStr = String(record.Date).trim();
  if (dateStr.indexOf('T') !== -1) dateStr = dateStr.split('T')[0];
  record.Date = dateStr;
  var res = updateTableRow('Record', 'Date', dateStr, record);
  if (res.status !== 'success') res = appendToTable('Record', record);
  return jsonResponse(res);
}
function addRecord(record) { return jsonResponse(appendToTable('Record', record)); }

/**
 * UPSERT method for Employee Calendar rows.
 * If the row for empId exists, it updates it. Otherwise, it appends a new row.
 */
function saveEmployeeCalendarRow(empId, calendarRow) {
  var empIdStr = String(empId).trim();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employee Calendar');
  if (!sheet) return jsonResponse({ status: 'error', message: 'Employee Calendar sheet not found' });
  
  var values = sheet.getDataRange().getValues();
  var headers = values.length > 0 ? values[0] : ['Employee ID', 'Employee Name'];
  
  // Ensure headers includes any new day columns passed in calendarRow
  var keys = Object.keys(calendarRow);
  var missingKeys = [];
  for (var k = 0; k < keys.length; k++) {
    var keyName = keys[k];
    if (headers.indexOf(keyName) === -1) {
      missingKeys.push(keyName);
    }
  }
  if (missingKeys.length > 0) {
    var startCol = headers.length + 1;
    for (var m = 0; m < missingKeys.length; m++) {
      sheet.getRange(1, startCol + m).setValue(missingKeys[m]);
      headers.push(missingKeys[m]);
    }
  }

  var empIdColIdx = headers.indexOf('Employee ID');
  if (empIdColIdx !== -1 && values.length > 1) {
    for (var i = 1; i < values.length; i++) {
      var rowEmpId = String(values[i][empIdColIdx]).trim();
      if (rowEmpId === empIdStr) {
        var rowNum = i + 1;
        for (var j = 0; j < headers.length; j++) {
          var key = headers[j];
          if (calendarRow[key] !== undefined) {
            sheet.getRange(rowNum, j + 1).setValue(calendarRow[key]);
          }
        }
        return jsonResponse({ status: 'success', message: 'Employee calendar updated.' });
      }
    }
  }

  // Row not found -> perform UPSERT append using current headers
  var newRow = [];
  for (var h = 0; h < headers.length; h++) {
    var hKey = headers[h];
    if (calendarRow[hKey] !== undefined && calendarRow[hKey] !== null) {
      newRow.push(calendarRow[hKey]);
    } else if (hKey === 'Employee ID') {
      newRow.push(empIdStr);
    } else if (hKey === 'Employee Name') {
      newRow.push(calendarRow['Employee Name'] || 'Employee');
    } else {
      newRow.push('Normal');
    }
  }
  sheet.appendRow(newRow);
  return jsonResponse({ status: 'success', message: 'Employee calendar created and updated.' });
}

function addEmployeeCalendarRow(calendarRow) { return jsonResponse(appendToTable('Employee Calendar', calendarRow)); }

function addEmployee(employeeData) {
  var emps = readTable('Employee Details');
  for (var i = 0; i < emps.length; i++) {
    if (emps[i]['Employee ID'].toString().trim() === employeeData['Employee ID'].toString().trim()) {
      return errorResponse('Employee ID exists.');
    }
  }
  appendToTable('Employee Details', employeeData);
  
  var defaultCalendarRow = { 'Employee ID': employeeData['Employee ID'], 'Employee Name': employeeData['Name'] };
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (var mIdx = 0; mIdx < months.length; mIdx++) {
    for (var d = 1; d <= daysInMonth[mIdx]; d++) {
      defaultCalendarRow[months[mIdx] + (d < 10 ? '0' + d : d)] = 'Normal';
    }
  }
  saveEmployeeCalendarRow(employeeData['Employee ID'], defaultCalendarRow);
  return jsonResponse({ status: 'success' });
}

function updateEmployee(employeeData) {
  var res = updateTableRow('Employee Details', 'Employee ID', employeeData['Employee ID'], employeeData);
  if (res.status === 'success') {
    saveEmployeeCalendarRow(employeeData['Employee ID'], { 'Employee Name': employeeData['Name'] });
  }
  return jsonResponse(res);
}

function deleteEmployee(employeeId) {
  deleteTableRow('Employee Details', 'Employee ID', employeeId);
  deleteTableRow('Employee Calendar', 'Employee ID', employeeId);
  return jsonResponse({ status: 'success' });
}

// ── DYNAMIC RECORD CALCULATOR ─────────────────────────────────────────────
function updateDailyRecord(dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var recordSheet = ss.getSheetByName('Record');
  var logSheet = ss.getSheetByName('Attendance log');
  var empSheet = ss.getSheetByName('Employee Details');
  var wcSheet = ss.getSheetByName('Working calendar');
  if (!recordSheet || !logSheet || !empSheet) return;
  
  var empData = empSheet.getDataRange().getValues();
  var totalEmployees = empData.length > 1 ? empData.length - 1 : 0; 

  var inTimeLimit = '09:00:00';
  var outTimeLimit = '18:00:00';
  var tz = Session.getScriptTimeZone();

  if (wcSheet && wcSheet.getLastRow() > 1) {
    var wcData = wcSheet.getDataRange().getValues();
    var wcHeaders = wcData[0];
    var inCol = wcHeaders.indexOf('In Time');
    if (inCol === -1) inCol = wcHeaders.indexOf('Working Time');
    var outCol = wcHeaders.indexOf('Out Time');

    for (var w = 1; w < wcData.length; w++) {
      var wDate = wcData[w][0];
      if (wDate instanceof Date) wDate = Utilities.formatDate(wDate, tz, 'yyyy-MM-dd');
      else wDate = String(wDate || '').trim();
      if (wDate === dateStr) {
        if (inCol !== -1 && wcData[w][inCol]) inTimeLimit = String(wcData[w][inCol]).trim();
        if (outCol !== -1 && wcData[w][outCol]) outTimeLimit = String(wcData[w][outCol]).trim();
        break;
      }
    }
  }
  
  var logData = logSheet.getDataRange().getValues();
  if (logData.length <= 1) return;
  
  var presentSet = {};
  var onDutySet = {};
  var lateInSet = {};
  var lateOutSet = {};

  var headers = logData[0];
  var empIdIdx = headers.indexOf('Employee ID');
  var dateIdx = headers.indexOf('Date');
  var modeIdx = headers.indexOf('Mode');
  var pInIdx = headers.indexOf('Punch In Time');
  var pOutIdx = headers.indexOf('Punch Out Time');
  
  for (var i = 1; i < logData.length; i++) {
    var row = logData[i];
    var rowDate = row[dateIdx];
    if (rowDate instanceof Date) rowDate = Utilities.formatDate(rowDate, tz, 'yyyy-MM-dd');
    else rowDate = String(rowDate || '').trim();
    if (rowDate.indexOf('T') !== -1) rowDate = rowDate.split('T')[0];
    
    if (rowDate === dateStr) {
      var id = String(row[empIdIdx] || '').trim();
      var mode = String(row[modeIdx] || '').trim().toLowerCase();
      if (!id) continue;
      
      if (mode === "working" || mode === "dayout" || mode === "lunch" || mode === "permission" || mode.indexOf("late") !== -1) {
        presentSet[id] = true;
      } else if (mode.indexOf("onduty") !== -1) {
        onDutySet[id] = true;
      }

      var pIn = row[pInIdx];
      var pOut = row[pOutIdx];
      var pInStr = pIn instanceof Date ? Utilities.formatDate(pIn, tz, 'HH:mm:ss') : String(pIn || '').trim();
      var pOutStr = pOut instanceof Date ? Utilities.formatDate(pOut, tz, 'HH:mm:ss') : String(pOut || '').trim();

      if (pInStr && pInStr !== '--' && inTimeLimit && inTimeLimit !== '--') {
        var pInCompare = pInStr.length === 5 ? pInStr + ':00' : pInStr;
        var inLimitCompare = inTimeLimit.length === 5 ? inTimeLimit + ':00' : inTimeLimit;
        if (pInCompare > inLimitCompare) lateInSet[id] = true;
      }

      if ((mode === "dayout" || mode.indexOf("dayclose") !== -1 || pOutStr) && pOutStr && pOutStr !== '--' && outTimeLimit && outTimeLimit !== '--') {
        var pOutCompare = pOutStr.length === 5 ? pOutStr + ':00' : pOutStr;
        var outLimitCompare = outTimeLimit.length === 5 ? outTimeLimit + ':00' : outLimitCompare;
        if (pOutCompare < outLimitCompare) lateOutSet[id] = true;
      }
    }
  }
  
  var presentCount = Object.keys(presentSet).length;
  var onDutyCount = 0;
  for (var id in onDutySet) {
    if (!presentSet[id]) onDutyCount++;
  }
  var absentCount = totalEmployees - presentCount - onDutyCount;
  if (absentCount < 0) absentCount = 0;

  var lateInCount = Object.keys(lateInSet).length;
  var lateOutCount = Object.keys(lateOutSet).length;
  
  var recordData = recordSheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < recordData.length; i++) {
    var rDate = recordData[i][0];
    if (rDate instanceof Date) rDate = Utilities.formatDate(rDate, tz, 'yyyy-MM-dd');
    else rDate = String(rDate || '').trim();
    if (rDate.indexOf('T') !== -1) rDate = rDate.split('T')[0];
    if (rDate === dateStr) { rowIndex = i + 1; break; }
  }
  
  if (rowIndex !== -1) {
    recordSheet.getRange(rowIndex, 2).setValue(presentCount);
    recordSheet.getRange(rowIndex, 3).setValue(onDutyCount);
    recordSheet.getRange(rowIndex, 4).setValue(absentCount);
    recordSheet.getRange(rowIndex, 5).setValue(lateInCount);
    recordSheet.getRange(rowIndex, 6).setValue(lateOutCount);
  } else {
    recordSheet.appendRow([dateStr, presentCount, onDutyCount, absentCount, lateInCount, lateOutCount]);
  }
}

// ── ESP32 & WEBSITE PUNCH LOGIC ─────────────────────────────────────────
function punchAttendanceLog(punchData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Attendance log');
  var empId   = String(punchData['Employee ID']).trim();
  var empName = String(punchData['Name'] || '').trim();
  var dateStr = String(punchData['Date']).trim();
  var timeStr = String(punchData['Time'] || punchData['Punch In Time'] || '').trim();
  var action  = String(punchData['Action'] || punchData['Mode'] || '').trim(); 
  var tz = Session.getScriptTimeZone();

  function addOneMinute(t) {
    var parts = t.split(':');
    var h = parseInt(parts[0] || '0', 10), m = parseInt(parts[1] || '0', 10), s = parseInt(parts[2] || '0', 10);
    m += 1;
    if (m >= 60) { m = 0; h += 1; }
    if (h >= 24)  h = 0;
    return (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m) + ':' + (s < 10 ? '0'+s : s);
  }

  function makeLogId(emp, date, mode, suffix) {
    return 'LOG_' + emp.replace(/[^A-Za-z0-9]/g,'') + '_' + date.replace(/-/g,'') + '_' + mode.toUpperCase() + '_' + suffix;
  }

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idxLogId = headers.indexOf('Log ID'), idxEmpId = headers.indexOf('Employee ID'), idxDate = headers.indexOf('Date');
  var idxPIn = headers.indexOf('Punch In Time'), idxPOut = headers.indexOf('Punch Out Time'), idxMode = headers.indexOf('Mode');

  function addDays(dateString, days) {
    var parts = dateString.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  }

  function getDaysBetween(d1, d2) {
    var p1 = d1.split('-');
    var p2 = d2.split('-');
    var date1 = new Date(p1[0], p1[1] - 1, p1[2]);
    var date2 = new Date(p2[0], p2[1] - 1, p2[2]);
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
  }

  function isSunday(dateString) {
    var parts = dateString.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.getDay() === 0;
  }

  var wcMap = {};
  var wcSheet = ss.getSheetByName('Working calendar');
  if (wcSheet && wcSheet.getLastRow() > 1) {
    var wcData = wcSheet.getDataRange().getValues();
    var wcHeaders = wcData[0];
    var wcDateIdx = wcHeaders.indexOf('Date');
    var wcInIdx = wcHeaders.indexOf('In Time');
    var wcOutIdx = wcHeaders.indexOf('Out Time');
    var wcWorkIdx = wcHeaders.indexOf('Is Working Day');
    if (wcDateIdx !== -1) {
      for (var w = 1; w < wcData.length; w++) {
        var wd = wcData[w][wcDateIdx] instanceof Date ? Utilities.formatDate(wcData[w][wcDateIdx], tz, 'yyyy-MM-dd') : String(wcData[w][wcDateIdx]).trim();
        if (wd.indexOf('T') !== -1) wd = wd.split('T')[0];
        var isW = wcWorkIdx !== -1 ? String(wcData[w][wcWorkIdx]).trim().toLowerCase() : '';
        
        var inTVal = wcInIdx !== -1 ? wcData[w][wcInIdx] : '';
        var inT = inTVal instanceof Date ? Utilities.formatDate(inTVal, tz, 'HH:mm:ss') : String(inTVal).trim();
        var outTVal = wcOutIdx !== -1 ? wcData[w][wcOutIdx] : '';
        var outT = outTVal instanceof Date ? Utilities.formatDate(outTVal, tz, 'HH:mm:ss') : String(outTVal).trim();
        
        wcMap[wd] = {
          start: inT,
          end: outT,
          isWorking: (isW === 'no' || isW === 'false' || isW === '0') ? false : true
        };
      }
    }
  }

  function getTimings(dStr) {
    var wt = wcMap[dStr];
    if (wt && wt.start && wt.end) {
      var s = wt.start, e = wt.end;
      if (s.length === 5) s += ':00';
      if (e.length === 5) e += ':00';
      return { start: s, end: e };
    }
    return { start: '09:00:00', end: '19:00:00' };
  }

  function isHoliday(dStr) {
    if (wcMap[dStr] !== undefined) {
      return !wcMap[dStr].isWorking;
    }
    return isSunday(dStr);
  }

  var lastOpenRow = -1, lastOpenData = null, lastOpenDateStr = '';
  for (var i = rows.length - 1; i >= 1; i--) {
    var r = rows[i];
    var rDate = r[idxDate] instanceof Date ? Utilities.formatDate(r[idxDate], tz, 'yyyy-MM-dd') : String(r[idxDate]).trim();
    if (rDate.indexOf('T') !== -1) rDate = rDate.split('T')[0];
    if (String(r[idxEmpId]).trim() !== empId) continue; // Note: removed rDate !== dateStr constraint to find past open records
    var hasIn = r[idxPIn] && String(r[idxPIn]).trim() !== '';
    var hasOut = r[idxPOut] && String(r[idxPOut]).trim() !== '';
    if ((hasIn && !hasOut) || (!hasIn && hasOut)) {
      lastOpenRow = i + 1; lastOpenData = r; lastOpenDateStr = rDate; break;
    }
  }

  if (lastOpenRow > 0 && lastOpenData) {
    var hasIn = lastOpenData[idxPIn] && String(lastOpenData[idxPIn]).trim() !== '';
    var outCol = hasIn ? (idxPOut + 1) : (idxPIn + 1);
    var lastMode = String(lastOpenData[idxMode] || 'Working');
    
    if (lastOpenDateStr === dateStr) {
      sheet.getRange(lastOpenRow, outCol).setValue(timeStr);
      if (action.toLowerCase() === 'checkout_dayclose' || action.toLowerCase() === 'dayclose') {
        sheet.getRange(lastOpenRow, idxMode + 1).setValue('DayOut');
      }
    } else {
      // Multi-day closure logic
      var origTimings = getTimings(lastOpenDateStr);
      sheet.getRange(lastOpenRow, outCol).setValue(origTimings.end);
      
      var daysDiff = getDaysBetween(lastOpenDateStr, dateStr);
      var isOnDuty = lastMode.toLowerCase().indexOf('onduty') !== -1;
      
      if (isOnDuty && daysDiff > 0 && daysDiff <= 30) {
        for (var d = 1; d < daysDiff; d++) {
          var midDate = addDays(lastOpenDateStr, d);
          if (isSunday(midDate)) continue; // Skip Sundays automatically
          var midTimings = getTimings(midDate);
          
          var midRow = new Array(headers.length).fill('');
          midRow[idxLogId] = makeLogId(empId, midDate, lastMode, (rows.length + d).toString());
          midRow[idxEmpId] = empId; midRow[headers.indexOf('Name')] = empName;
          midRow[idxDate] = midDate; midRow[idxPIn] = midTimings.start; midRow[idxPOut] = midTimings.end; midRow[idxMode] = lastMode;
          sheet.appendRow(midRow);
          updateDailyRecord(midDate);
        }
        if (!isHoliday(dateStr)) {
          var todayTimings = getTimings(dateStr);
          var todayRow = new Array(headers.length).fill('');
          todayRow[idxLogId] = makeLogId(empId, dateStr, lastMode, (rows.length + 30).toString());
          todayRow[idxEmpId] = empId; todayRow[headers.indexOf('Name')] = empName;
          todayRow[idxDate] = dateStr; todayRow[idxPIn] = todayTimings.start; todayRow[idxPOut] = timeStr; todayRow[idxMode] = lastMode;
          if (action.toLowerCase() === 'checkout_dayclose' || action.toLowerCase() === 'dayclose') {
            todayRow[idxMode] = 'DayOut';
          }
          sheet.appendRow(todayRow);
        }
      }
    }
  }

  var responseObj = { status: 'success' };
  var actionLower = action.toLowerCase();

  if (actionLower === 'checkin' || actionLower === 'working') {
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = makeLogId(empId, dateStr, 'WORKING', rows.length.toString());
    newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; newRow[idxPIn] = timeStr; newRow[idxMode] = 'Working';
    sheet.appendRow(newRow);
    responseObj.type = 'check_in';
  }
  else if (actionLower === 'return') {
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = makeLogId(empId, dateStr, 'WORKING', rows.length.toString());
    newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; newRow[idxPIn] = timeStr; newRow[idxMode] = 'Working';
    sheet.appendRow(newRow);
    responseObj.type = 'return';
  }
  else if (actionLower === 'checkout_onduty' || actionLower === 'onduty') {
    var logId = makeLogId(empId, dateStr, 'ONDUTY', rows.length.toString());
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = logId; newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; newRow[idxPIn] = timeStr; newRow[idxMode] = 'OnDuty (Pending)';
    sheet.appendRow(newRow);
    
    var onDutySheet = ss.getSheetByName('On duty');
    if (onDutySheet) {
      onDutySheet.appendRow([logId, empId, empName, dateStr, timeStr, "Field Work (Biometric)", "Pending", ""]);
    }
    responseObj.type = 'onduty_out';
  }
  else if (actionLower === 'checkout_lunch' || actionLower === 'lunch') {
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = makeLogId(empId, dateStr, 'LUNCH', rows.length.toString());
    newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; newRow[idxPIn] = timeStr; newRow[idxMode] = 'Lunch';
    sheet.appendRow(newRow);
    responseObj.type = 'lunch_out';
  }
  else if (actionLower === 'checkout_permission' || actionLower === 'permission') {
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = makeLogId(empId, dateStr, 'PERMISSION', rows.length.toString());
    newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; newRow[idxPIn] = timeStr; newRow[idxMode] = 'Permission';
    sheet.appendRow(newRow);
    responseObj.type = 'permission_out';
  }
  else if (actionLower === 'checkout_dayclose' || actionLower === 'dayclose') {
    if (!(lastOpenRow > 0 && lastOpenDateStr === dateStr)) {
      var newRow = new Array(headers.length).fill('');
      newRow[idxLogId] = makeLogId(empId, dateStr, 'DAYCLOSE', rows.length.toString());
      newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
      newRow[idxDate] = dateStr; newRow[idxPOut] = timeStr; newRow[idxMode] = 'DayOut';
      sheet.appendRow(newRow);
    }
    responseObj.type = 'day_close';
  }
  else {
    var logId = makeLogId(empId, dateStr, action.toUpperCase() || 'PUNCH', rows.length.toString());
    var newRow = new Array(headers.length).fill('');
    newRow[idxLogId] = logId; newRow[idxEmpId] = empId; newRow[headers.indexOf('Name')] = empName;
    newRow[idxDate] = dateStr; 
    newRow[idxPIn] = punchData['Punch In Time'] || timeStr; 
    newRow[idxPOut] = punchData['Punch Out Time'] || ''; 
    newRow[idxMode] = action || 'Working';
    sheet.appendRow(newRow);
    responseObj.type = 'punch';
  }
  
  updateDailyRecord(dateStr);
  return jsonResponse(responseObj);
}

function addAttendanceLog(log) { 
  var res = appendToTable('Attendance log', log);
  if (log.Date) updateDailyRecord(log.Date);
  return jsonResponse(res);
}

// ── ON DUTY REQUESTS ──────────────────────────────────────────────────────
function submitOnDutyRequest(requestData) {
  var reqId = 'REQ_' + Math.floor(Math.random() * 1000000);
  var newRequest = {
    'Request ID': reqId,
    'Employee ID': requestData['Employee ID'],
    'Name': requestData['Name'],
    'Date': requestData['Date'],
    'Time': requestData['Time'] || '09:00',
    'Reason': requestData['Reason'],
    'Status': requestData['Status'] || 'Pending',
    'Approved By': requestData['Approved By'] || ''
  };
  appendToTable('On duty', newRequest);
  return jsonResponse({ status: 'success' });
}

function addOnDutyRequest(request) { return jsonResponse(appendToTable('On duty', request)); }

function updateOnDutyStatus(approvalData) {
  var res = updateTableRow('On duty', 'Request ID', approvalData.request_id, {
    'Status': approvalData.status,
    'Approved By': approvalData.approved_by
  });
  
  if (approvalData.status === 'Approved') {
    updateTableRow('Attendance log', 'Log ID', approvalData.request_id, {
      'Mode': 'OnDuty (Approved)'
    });
    
    var reqs = readTable('On duty');
    for (var i = 0; i < reqs.length; i++) {
      if (reqs[i]['Request ID'].toString().trim() === approvalData.request_id.toString().trim()) {
        updateDailyRecord(reqs[i]['Date']);
        break;
      }
    }
  }
  return jsonResponse(res);
}

function deleteOnDutyRequest(requestId) { return jsonResponse(deleteTableRow('On duty', 'Request ID', requestId)); }

/**
 * UPSERT method for Working Calendar.
 * If the row for dateStr exists, it updates it. Otherwise, it appends a new row.
 */
function saveWorkingCalendar(calendarData) {
  var dateStr = String(calendarData['Date']).trim();
  if (dateStr.indexOf('T') !== -1) dateStr = dateStr.split('T')[0];
  calendarData['Date'] = dateStr;

  var res = updateTableRow('Working calendar', 'Date', dateStr, calendarData);
  if (res.status !== 'success') {
    res = appendToTable('Working calendar', calendarData);
  }
  return jsonResponse(res);
}

function addWorkingCalendar(wc) { return jsonResponse(appendToTable('Working calendar', wc)); }
function submitContactInquiry(contactData) { return jsonResponse(appendToTable('Contacts', contactData)); }
function addContact(contact) { return jsonResponse(appendToTable('Contacts', contact)); }

// ── ESP32 DATA ENDPOINTS ──────────────────────────────────────────────────
function getEmployeesForESP32() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employee Details");
  if (!sheet) return jsonResponse([]);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse([]);
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var employees = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var empId = String(row[0]).trim();
    if (empId === "" || empId === "undefined") continue;
    var fpSlot = row[1];
    employees.push({
      id: empId, name: String(row[2]).trim(), dob: String(row[3]).trim(), doj: String(row[4]).trim(),
      gender: String(row[7]).trim(), password: String(row[11]).trim(),
      fpSlot: (fpSlot === "" || fpSlot === null) ? -1 : Number(fpSlot)
    });
  }
  return jsonResponse(employees);
}

function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var currentMonth = today.substring(0, 7);
  var logSheet = ss.getSheetByName('Attendance log');
  var presentToday = 0, monthPresentPct = 0, monthWorkingHrsPct = 0, monthOnTimeEntryPct = 0, monthOnTimeExitPct = 0;

  if (logSheet && logSheet.getLastRow() > 1) {
    var logs = logSheet.getDataRange().getValues();
    var headers = logs[0], empIdIdx = headers.indexOf('Employee ID'), dateIdx = headers.indexOf('Date');
    var pInIdx = headers.indexOf('Punch In Time'), pOutIdx = headers.indexOf('Punch Out Time'), modeIdx = headers.indexOf('Mode');
    var totalEntries = 0, totalHrs = 0, onTimeEntries = 0, onTimeExits = 0, presentDaysSet = {}, todayEmployees = {};

    var wcMap = {};
    var wcSheet = ss.getSheetByName('Working calendar');
    if (wcSheet && wcSheet.getLastRow() > 1) {
      var wcData = wcSheet.getDataRange().getValues();
      var wcHeaders = wcData[0];
      var wcDateIdx = wcHeaders.indexOf('Date');
      var wcWorkIdx = wcHeaders.indexOf('Is Working Day');
      var wcInIdx = wcHeaders.indexOf('In Time');
      var wcOutIdx = wcHeaders.indexOf('Out Time');
      if (wcDateIdx !== -1) {
        for (var w = 1; w < wcData.length; w++) {
          var wd = wcData[w][wcDateIdx] instanceof Date ? Utilities.formatDate(wcData[w][wcDateIdx], tz, 'yyyy-MM-dd') : String(wcData[w][wcDateIdx]).trim();
          if (wd.indexOf('T') !== -1) wd = wd.split('T')[0];
          var isW = wcWorkIdx !== -1 ? String(wcData[w][wcWorkIdx]).trim().toLowerCase() : '';
          
          var inTVal = wcInIdx !== -1 ? wcData[w][wcInIdx] : '';
          var inT = inTVal instanceof Date ? Utilities.formatDate(inTVal, tz, 'HH:mm:ss') : String(inTVal).trim();
          var outTVal = wcOutIdx !== -1 ? wcData[w][wcOutIdx] : '';
          var outT = outTVal instanceof Date ? Utilities.formatDate(outTVal, tz, 'HH:mm:ss') : String(outTVal).trim();
          
          wcMap[wd] = {
            isWorking: (isW === 'no' || isW === 'false' || isW === '0') ? false : true,
            inLimit: inT || '09:00:00',
            outLimit: outT || '18:00:00'
          };
        }
      }
    }

    for (var i = 1; i < logs.length; i++) {
      var row = logs[i], rowDate = row[dateIdx];
      if (rowDate instanceof Date) rowDate = Utilities.formatDate(rowDate, tz, 'yyyy-MM-dd');
      else rowDate = String(rowDate || '').trim();
      if (rowDate.indexOf('T') !== -1) rowDate = rowDate.split('T')[0];
      if (!rowDate) continue;

      var empId = String(row[empIdIdx] || '').trim();
      if (rowDate === today && empId) todayEmployees[empId] = true;
      if (rowDate.substring(0, 7) !== currentMonth) continue;
      if (String(row[modeIdx] || '').toLowerCase() !== 'working') continue;

      var key = empId + '_' + rowDate;
      if (presentDaysSet[key]) continue;
      presentDaysSet[key] = true;
      totalEntries++;

      var pIn = row[pInIdx], pOut = row[pOutIdx];
      var inH = -1, inM = -1, outH = -1, outM = -1;

      if (pIn instanceof Date) {
        inH = pIn.getHours(); inM = pIn.getMinutes();
      } else if (pIn) {
        var strIn = String(pIn).trim();
        if (strIn.indexOf(':') !== -1) {
          var p1 = strIn.split(':');
          inH = parseInt(p1[0], 10); inM = parseInt(p1[1], 10);
        }
      }

      if (pOut instanceof Date) {
        outH = pOut.getHours(); outM = pOut.getMinutes();
      } else if (pOut) {
        var strOut = String(pOut).trim();
        if (strOut.indexOf(':') !== -1) {
          var p2 = strOut.split(':');
          outH = parseInt(p2[0], 10); outM = parseInt(p2[1], 10);
        }
      }

      if (inH >= 0 && inM >= 0) {
        var inMins = inH * 60 + inM;
        var inLimitStr = wcMap[rowDate] && wcMap[rowDate].inLimit ? wcMap[rowDate].inLimit : '09:00:00';
        var inLimitMins = parseInt(inLimitStr.split(':')[0]) * 60 + parseInt(inLimitStr.split(':')[1]);
        if (inMins <= inLimitMins) onTimeEntries++;

        if (outH >= 0 && outM >= 0) {
          var outMins = outH * 60 + outM;
          var outLimitStr = wcMap[rowDate] && wcMap[rowDate].outLimit ? wcMap[rowDate].outLimit : '18:00:00';
          var outLimitMins = parseInt(outLimitStr.split(':')[0]) * 60 + parseInt(outLimitStr.split(':')[1]);
          
          var hrs = (outMins - inMins) / 60.0;
          if (hrs > 0) totalHrs += hrs;
          if (outMins <= outLimitMins) onTimeExits++;
        }
      }
    }
    presentToday = Object.keys(todayEmployees).length;
    var empCount = 0, empSheet = ss.getSheetByName('Employee Details');
    if (empSheet && empSheet.getLastRow() > 1) empCount = empSheet.getLastRow() - 1;

    var workingDaysElapsed = 0;
    var parts = today.split('-');
    var tDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var d = 1;
    while (true) {
      var loopDate = new Date(parts[0], parts[1] - 1, d);
      if (loopDate > tDate || loopDate.getMonth() !== (parseInt(parts[1], 10) - 1)) break;
      var dStr = Utilities.formatDate(loopDate, tz, 'yyyy-MM-dd');
      
      var isW = true;
      if (loopDate.getDay() === 0) isW = false;
      if (wcMap[dStr] && wcMap[dStr].isWorking === false) isW = false;
      if (wcMap[dStr] && wcMap[dStr].isWorking === true) isW = true; 
      
      if (isW) workingDaysElapsed++;
      d++;
    }
    if (workingDaysElapsed === 0) workingDaysElapsed = 1;

    monthPresentPct = empCount > 0 ? Math.round((totalEntries / (empCount * workingDaysElapsed)) * 100) : 0;
    monthWorkingHrsPct = totalEntries > 0 ? Math.round((totalHrs / totalEntries / 8.0) * 100) : 0;
    monthOnTimeEntryPct = totalEntries > 0 ? Math.round((onTimeEntries / totalEntries) * 100) : 0;
    monthOnTimeExitPct = totalEntries > 0 ? Math.round((onTimeExits / totalEntries) * 100) : 0;
  }

  var lateInToday = 0, lateOutToday = 0;
  var recordSheet = ss.getSheetByName('Record');
  if (recordSheet && recordSheet.getLastRow() > 1) {
    var recs = recordSheet.getDataRange().getValues();
    var recHeaders = recs[0];
    var lInCol = recHeaders.indexOf('LateIn');
    var lOutCol = recHeaders.indexOf('LateOut');
    for (var r = 1; r < recs.length; r++) {
      var rD = recs[r][0];
      if (rD instanceof Date) rD = Utilities.formatDate(rD, tz, 'yyyy-MM-dd');
      else rD = String(rD || '').trim();
      if (rD === today) {
        if (lInCol !== -1) lateInToday = Number(recs[r][lInCol] || 0);
        if (lOutCol !== -1) lateOutToday = Number(recs[r][lOutCol] || 0);
        break;
      }
    }
  }

  return jsonResponse({ status: 'success', presentToday: presentToday, lateInToday: lateInToday, lateOutToday: lateOutToday, monthPresentPct: monthPresentPct, monthWorkingHrsPct: monthWorkingHrsPct, monthOnTimeEntryPct: monthOnTimeEntryPct, monthOnTimeExitPct: monthOnTimeExitPct });
}

function getEmployeeStats(empId) {
  if (!empId) return errorResponse("Missing empId");
  var ss = SpreadsheetApp.getActiveSpreadsheet(), tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var currentMonth = today.substring(0, 7), logSheet = ss.getSheetByName('Attendance log');
  if (!logSheet) return errorResponse("Attendance log sheet not found");
  
  var logs = logSheet.getDataRange().getValues();
  if (logs.length <= 1) return jsonResponse({ status: "success", presentDays: 0, absentDays: 0, workHrsPct: 0, avgWorkHrs: "0h 0m", onTimeEntryPct: 0, avgEntryTime: "-", onTimeExitPct: 0, avgExitTime: "-" });
  
  var headers = logs[0], empIdIdx = headers.indexOf('Employee ID'), dateIdx = headers.indexOf('Date');
  var pInIdx = headers.indexOf('Punch In Time'), pOutIdx = headers.indexOf('Punch Out Time');
  var uniqueDates = {}, totalWorkMins = 0, onTimeEntryCount = 0, onTimeExitCount = 0, totalEntryMins = 0, totalExitMins = 0, validEntryCount = 0, validExitCount = 0;
  
  var wcMap = {};
  var wcSheet = ss.getSheetByName('Working calendar');
  if (wcSheet && wcSheet.getLastRow() > 1) {
    var wcData = wcSheet.getDataRange().getValues();
    var wcHeaders = wcData[0];
    var wcDateIdx = wcHeaders.indexOf('Date');
    var wcInIdx = wcHeaders.indexOf('In Time');
    var wcOutIdx = wcHeaders.indexOf('Out Time');
    if (wcDateIdx !== -1) {
      for (var w = 1; w < wcData.length; w++) {
        var wd = wcData[w][wcDateIdx] instanceof Date ? Utilities.formatDate(wcData[w][wcDateIdx], tz, 'yyyy-MM-dd') : String(wcData[w][wcDateIdx]).trim();
        if (wd.indexOf('T') !== -1) wd = wd.split('T')[0];
        
        var inTVal = wcInIdx !== -1 ? wcData[w][wcInIdx] : '';
        var inT = inTVal instanceof Date ? Utilities.formatDate(inTVal, tz, 'HH:mm:ss') : String(inTVal).trim();
        var outTVal = wcOutIdx !== -1 ? wcData[w][wcOutIdx] : '';
        var outT = outTVal instanceof Date ? Utilities.formatDate(outTVal, tz, 'HH:mm:ss') : String(outTVal).trim();
        
        wcMap[wd] = { inLimit: inT || '09:00:00', outLimit: outT || '18:00:00' };
      }
    }
  }

  for (var i = 1; i < logs.length; i++) {
    var row = logs[i];
    if (row[empIdIdx] === undefined || String(row[empIdIdx]).trim() !== empId.toString().trim()) continue;
    var rowDate = row[dateIdx];
    if (rowDate instanceof Date) rowDate = Utilities.formatDate(rowDate, tz, 'yyyy-MM-dd');
    else rowDate = String(rowDate || '').trim();
    if (rowDate.indexOf('T') !== -1) rowDate = rowDate.split('T')[0];
    if (rowDate.substring(0, 7) !== currentMonth) continue;
    
    var pIn = row[pInIdx], pOut = row[pOutIdx];
    var inMins = -1, outMins = -1;

    if (pIn instanceof Date) {
      inMins = (pIn.getHours() * 60) + pIn.getMinutes();
    } else if (pIn) {
      var strIn = String(pIn).trim();
      if (strIn.indexOf(':') !== -1) {
        var p1 = strIn.split(':');
        inMins = (parseInt(p1[0], 10) * 60) + parseInt(p1[1], 10);
      }
    }

    if (pOut instanceof Date) {
      outMins = (pOut.getHours() * 60) + pOut.getMinutes();
    } else if (pOut) {
      var strOut = String(pOut).trim();
      if (strOut.indexOf(':') !== -1) {
        var p2 = strOut.split(':');
        outMins = (parseInt(p2[0], 10) * 60) + parseInt(p2[1], 10);
      }
    }

    if (inMins >= 0) {
      uniqueDates[rowDate] = true;
      totalEntryMins += inMins; validEntryCount++;
      
      var inLimitStr = wcMap[rowDate] && wcMap[rowDate].inLimit ? wcMap[rowDate].inLimit : '09:00:00';
      var inLimitMins = parseInt(inLimitStr.split(':')[0]) * 60 + parseInt(inLimitStr.split(':')[1]);
      if (inMins <= inLimitMins) onTimeEntryCount++;

      if (outMins >= 0) {
        totalExitMins += outMins; validExitCount++;
        
        var outLimitStr = wcMap[rowDate] && wcMap[rowDate].outLimit ? wcMap[rowDate].outLimit : '18:00:00';
        var outLimitMins = parseInt(outLimitStr.split(':')[0]) * 60 + parseInt(outLimitStr.split(':')[1]);
        if (outMins <= outLimitMins) onTimeExitCount++;
        
        var diffMins = outMins - inMins;
        if (diffMins > 0) totalWorkMins += diffMins;
      }
    }
  }
  
  var presentDays = Object.keys(uniqueDates).length, avgWorkMins = presentDays > 0 ? (totalWorkMins / presentDays) : 0;
  var avgWorkHrsStr = Math.floor(avgWorkMins / 60) + "h " + Math.round(avgWorkMins % 60) + "m";
  var workHrsPct = presentDays > 0 ? Math.min(100, Math.round((avgWorkMins / (8 * 60)) * 100)) : 0;
  
  var onTimeEntryPct = validEntryCount > 0 ? Math.round((onTimeEntryCount / validEntryCount) * 100) : 0;
  var avgEntryMins = validEntryCount > 0 ? (totalEntryMins / validEntryCount) : 0;
  var avgEntryStr = validEntryCount > 0 ? (String(Math.floor(avgEntryMins / 60)).padStart(2, '0') + ":" + String(Math.round(avgEntryMins % 60)).padStart(2, '0')) : "-";
    
  var onTimeExitPct = validExitCount > 0 ? Math.round((onTimeExitCount / validExitCount) * 100) : 0;
  var avgExitMins = validExitCount > 0 ? (totalExitMins / validExitCount) : 0;
  var avgExitStr = validExitCount > 0 ? (String(Math.floor(avgExitMins / 60)).padStart(2, '0') + ":" + String(Math.round(avgExitMins % 60)).padStart(2, '0')) : "-";

  var lateInDays = validEntryCount - onTimeEntryCount; if (lateInDays < 0) lateInDays = 0;
  var lateOutDays = validExitCount - onTimeExitCount; if (lateOutDays < 0) lateOutDays = 0;

  return jsonResponse({ status: "success", presentDays: presentDays, absentDays: 0, lateInDays: lateInDays, lateOutDays: lateOutDays, workHrsPct: workHrsPct, avgWorkHrs: avgWorkHrsStr, onTimeEntryPct: onTimeEntryPct, avgEntryTime: avgEntryStr, onTimeExitPct: onTimeExitPct, avgExitTime: avgExitStr });
}
