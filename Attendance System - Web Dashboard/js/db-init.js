/**
 * Spark Drives and Automations (SparkDNA) - Database Seeder
 * File: js/db-init.js
 * 
 * Seeder to initialize LocalStorage with rich mock data for SparkDNA.
 * Allows the website to run fully dynamically even before connecting to Google Sheets.
 */

(function () {
  // Key names in LocalStorage to match api.js
  const DB_KEYS = {
    admins: 'sparkdna_admins',
    records: 'sparkdna_records',
    emp_calendars: 'sparkdna_emp_calendars',
    employees: 'sparkdna_employees',
    attendance_logs: 'sparkdna_attendance_logs',
    onduty_requests: 'sparkdna_onduty_requests',
    working_calendar: 'sparkdna_working_calendar',
    contacts: 'sparkdna_contacts'
  };

  // Check if database is already initialized
  if (localStorage.getItem(DB_KEYS.employees)) {
    console.log('SparkDNA Local Database already exists.');
    return;
  }

  console.log('Initializing SparkDNA Local Database with high-fidelity seed data...');

  // 1. Admins (Sheet 1)
  const admins = [
    { username: 'admin', password: 'admin123' },
    { username: 'neha', password: 'password123' }
  ];

  // 2. Employees (Sheet 4 - Details)
  const employees = [
    {
      'Employee ID': 'EMP101',
      'Fingerprint ID': 1,
      'Name': 'Subhash Chandra',
      'Date of Birth': '1990-05-14',
      'Date of Joining': '2024-01-15',
      'Address': '12, Gandhipuram, Coimbatore, TN',
      'Aadhar Number': '1234-5678-9012',
      'Gender': 'Male',
      'Blood Group': 'O+',
      'Email': 'subhash@sparkdna.com',
      'Phone': '+91 98765 43210',
      'Password': 'user123'
    },
    {
      'Employee ID': 'EMP102',
      'Fingerprint ID': 2,
      'Name': 'Rajesh Kumar',
      'Date of Birth': '1988-11-22',
      'Date of Joining': '2024-03-10',
      'Address': '45, Peelamedu, Coimbatore, TN',
      'Aadhar Number': '2345-6789-0123',
      'Gender': 'Male',
      'Blood Group': 'A+',
      'Email': 'rajesh@sparkdna.com',
      'Phone': '+91 98765 43211',
      'Password': 'user123'
    },
    {
      'Employee ID': 'EMP103',
      'Fingerprint ID': 3,
      'Name': 'Anjali Sharma',
      'Date of Birth': '1995-08-05',
      'Date of Joining': '2024-06-01',
      'Address': '78, Vilankurichi Road, Coimbatore, TN',
      'Aadhar Number': '3456-7890-1234',
      'Gender': 'Female',
      'Blood Group': 'B+',
      'Email': 'anjali@sparkdna.com',
      'Phone': '+91 98765 43212',
      'Password': 'user123'
    },
    {
      'Employee ID': 'EMP104',
      'Fingerprint ID': 4,
      'Name': 'Vikram Singh',
      'Date of Birth': '1992-04-30',
      'Date of Joining': '2024-08-20',
      'Address': '11, Saravanampatti, Coimbatore, TN',
      'Aadhar Number': '4567-8901-2345',
      'Gender': 'Male',
      'Blood Group': 'AB+',
      'Email': 'vikram@sparkdna.com',
      'Phone': '+91 98765 43213',
      'Password': 'user123'
    },
    {
      'Employee ID': 'EMP105',
      'Fingerprint ID': 5,
      'Name': 'Neha Gupta',
      'Date of Birth': '1987-12-15',
      'Date of Joining': '2024-11-05',
      'Address': '89, Kalapatti, Coimbatore, TN',
      'Aadhar Number': '5678-9012-3456',
      'Gender': 'Female',
      'Blood Group': 'O-',
      'Email': 'neha@sparkdna.com',
      'Phone': '+91 98765 43214',
      'Password': 'user123'
    },
    {
      'Employee ID': 'EMP106',
      'Fingerprint ID': 6,
      'Name': 'Amit Patel',
      'Date of Birth': '1997-02-18',
      'Date of Joining': '2025-01-10',
      'Address': '56, RS Puram, Coimbatore, TN',
      'Aadhar Number': '6789-0123-4567',
      'Gender': 'Male',
      'Blood Group': 'A-',
      'Email': 'amit@sparkdna.com',
      'Phone': '+91 98765 43215',
      'Password': 'user123'
    }
  ];

  // Helper to build dates for past N days
  function getRecentDates(count) {
    const dates = [];
    let d = new Date();
    for (let i = 0; i < count; i++) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      d.setDate(d.getDate() - 1);
    }
    return dates.reverse(); // Chronological order
  }

  const past30Days = getRecentDates(30);

  // 3. Working Calendar (Sheet 7)
  const workingCalendar = [];
  past30Days.forEach(dStr => {
    const date = new Date(dStr);
    const isSunday = date.getDay() === 0;
    workingCalendar.push({
      'Date': dStr,
      'Is Working Day': isSunday ? 'No' : 'Yes',
      'In Time': isSunday ? '--' : '09:00:00',
      'Out Time': isSunday ? '--' : '18:00:00',
      'Working Time': isSunday ? '--' : '09:00:00'
    });
  });

  // Seed future 30 days as well
  let futureD = new Date();
  for (let i = 1; i <= 30; i++) {
    futureD.setDate(futureD.getDate() + 1);
    const yyyy = futureD.getFullYear();
    const mm = String(futureD.getMonth() + 1).padStart(2, '0');
    const dd = String(futureD.getDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;
    const isSunday = futureD.getDay() === 0;
    workingCalendar.push({
      'Date': dStr,
      'Is Working Day': isSunday ? 'No' : 'Yes',
      'In Time': isSunday ? '--' : '09:00:00',
      'Out Time': isSunday ? '--' : '18:00:00',
      'Working Time': isSunday ? '--' : '09:00:00'
    });
  }

  // 4. Employee Calendar (Sheet 3)
  const empCalendars = [];
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  employees.forEach(emp => {
    const calRow = {
      'Employee ID': emp['Employee ID'],
      'Employee Name': emp['Name']
    };

    months.forEach((m, mIdx) => {
      for (let d = 1; d <= daysInMonth[mIdx]; d++) {
        const colName = `${m}${String(d).padStart(2, '0')}`;
        // Mark all as 'Normal' by default
        calRow[colName] = 'Normal';
      }
    });

    // Seed some random extra/compensation days for demonstration (e.g. jan05, feb12)
    calRow['jan05'] = 'Extra';
    calRow['feb12'] = 'Compensation';
    calRow['mar18'] = 'Leave';

    empCalendars.push(calRow);
  });

  // 5. Attendance Logs (Sheet 5) & Records (Sheet 2)
  const attendanceLogs = [];
  const records = [];

  // Generate historical data day-by-day
  past30Days.forEach(dateStr => {
    const dateObj = new Date(dateStr);
    const isSunday = dateObj.getDay() === 0;

    let presentCount = 0;
    let onDutyCount = 0;
    let absentCount = 0;

    let lateInCount = 0;
    let lateOutCount = 0;

    if (isSunday) {
      records.push({
        'Date': dateStr,
        'Present': 0,
        'OnDuty': 0,
        'Absent': 0,
        'LateIn': 0,
        'LateOut': 0
      });
      return;
    }

    employees.forEach(emp => {
      const rand = Math.random();
      
      if (rand > 0.15) { // 85% present rate
        presentCount++;
        const isLateIn = Math.random() < 0.15; // 15% late in
        const isLateOut = Math.random() < 0.10; // 10% late out
        if (isLateIn) lateInCount++;
        if (isLateOut) lateOutCount++;

        let punchIn = isLateIn ? '09:25:00' : '08:45:00';
        let punchOut = isLateOut ? '18:30:00' : '17:55:00';

        // Calculate hours
        const inParts = punchIn.split(':').map(Number);
        const outParts = punchOut.split(':').map(Number);
        const hrs = (outParts[0] + outParts[1]/60) - (inParts[0] + inParts[1]/60);

        const logId = `LOG_${emp['Employee ID']}_${dateStr.replace(/-/g, '')}_WORKING`;
        attendanceLogs.push({
          'Log ID': logId,
          'Employee ID': emp['Employee ID'],
          'Name': emp['Name'],
          'Date': dateStr,
          'Punch In Time': punchIn,
          'Punch Out Time': punchOut,
          'Mode': 'Working',
          'hours_worked': parseFloat(hrs.toFixed(2))
        });
      } else if (rand > 0.05) { // 10% absent
        absentCount++;
      } else { // 5% OnDuty
        onDutyCount++;
        const logId = `LOG_${emp['Employee ID']}_${dateStr.replace(/-/g, '')}_ONDUTY`;
        attendanceLogs.push({
          'Log ID': logId,
          'Employee ID': emp['Employee ID'],
          'Name': emp['Name'],
          'Date': dateStr,
          'Punch In Time': '09:00:00',
          'Punch Out Time': '17:30:00',
          'Mode': 'Onduty',
          'hours_worked': 8.5
        });
      }
    });

    records.push({
      'Date': dateStr,
      'Present': presentCount,
      'OnDuty': onDutyCount,
      'Absent': absentCount,
      'LateIn': lateInCount,
      'LateOut': lateOutCount
    });
  });

  // 6. On-Duty Requests (Sheet 6)
  const onDutyRequests = [
    {
      'Request ID': 'REQ_849201',
      'Employee ID': 'EMP104',
      'Name': 'Vikram Singh',
      'Date': past30Days[25],
      'Time': '09:00',
      'Reason': 'Biometric installation at client factory, Coimbatore.',
      'Status': 'Approved',
      'Approved By': 'admin'
    },
    {
      'Request ID': 'REQ_291039',
      'Employee ID': 'EMP102',
      'Name': 'Rajesh Kumar',
      'Date': past30Days[20],
      'Time': '10:00',
      'Reason': 'Control Panel commissioning at site, RS Puram.',
      'Status': 'Approved',
      'Approved By': 'admin'
    },
    {
      'Request ID': 'REQ_738491',
      'Employee ID': 'EMP101',
      'Name': 'Subhash Chandra',
      'Date': past30Days[15],
      'Time': '09:30',
      'Reason': 'Firmware upgrade audit at ABC Castings Unit.',
      'Status': 'Rejected',
      'Approved By': 'admin'
    },
    {
      'Request ID': 'REQ_pending_1',
      'Employee ID': 'EMP103',
      'Name': 'Anjali Sharma',
      'Date': new Date().toISOString().split('T')[0], // Today
      'Time': '09:00',
      'Reason': 'Biometric hardware sourcing from local suppliers.',
      'Status': 'Pending',
      'Approved By': ''
    }
  ];

  // 7. Contacts (Sheet 8)
  const contacts = [
    {
      'Contact Person Name': 'Sanjay Verma',
      'Business Email': 'sanjay@vermaforgings.com',
      'Mobile Number': '+91 98840 12345',
      'Company Name': 'Verma Forgings Pvt Ltd',
      'Employee Size': '51-150',
      'Product Required': 'BioGate Pro',
      'Requirement Details': 'We need 3 biometric terminals with high-durability sensors for our metal casting shop floors.'
    },
    {
      'Contact Person Name': 'Karthik Raja',
      'Business Email': 'karthik@precisionscrews.in',
      'Mobile Number': '+91 94430 98765',
      'Company Name': 'Precision Screws & Dies',
      'Employee Size': '16-50',
      'Product Required': 'BioEntry Mini',
      'Requirement Details': 'Interested in linking attendance logs directly to our payroll google sheets.'
    }
  ];

  // Save everything to LocalStorage
  localStorage.setItem(DB_KEYS.admins, JSON.stringify(admins));
  localStorage.setItem(DB_KEYS.records, JSON.stringify(records));
  localStorage.setItem(DB_KEYS.emp_calendars, JSON.stringify(empCalendars));
  localStorage.setItem(DB_KEYS.employees, JSON.stringify(employees));
  localStorage.setItem(DB_KEYS.attendance_logs, JSON.stringify(attendanceLogs));
  localStorage.setItem(DB_KEYS.onduty_requests, JSON.stringify(onDutyRequests));
  localStorage.setItem(DB_KEYS.working_calendar, JSON.stringify(workingCalendar));
  localStorage.setItem(DB_KEYS.contacts, JSON.stringify(contacts));

  console.log('SparkDNA Local Database successfully seeded with 8 tables.');
})();
