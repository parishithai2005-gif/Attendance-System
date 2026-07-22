// sheets.h
#pragma once
#include <Arduino.h>

struct DashboardStats {
  int   presentToday       = 0;
  int   monthPresentPct    = 0;
  int   monthWorkingHrsPct = 0;
  int   monthOnTimeEntryPct = 0;
  int   monthOnTimeExitPct  = 0;
};

struct EmployeeStats {
  int presentDays = 0;
  int absentDays = 0;
  int workHrsPct = 0;
  String avgWorkHrs = "0h 0m";
  int onTimeEntryPct = 0;
  String avgEntryTime = "-";
  int onTimeExitPct = 0;
  String avgExitTime = "-";
};

bool fetchDashboardStats(DashboardStats& out);
bool fetchEmployeeStats(const String& empId, EmployeeStats& out);

bool sendRegisterFingerprint(String employeeId, String fingerprintId);
bool sendCheckIn(String empId, String empName, String date, String time);
bool sendReturn(String empId, String empName, String date, String time);
bool sendCheckOut(String empId, String empName, String date, String time, String mode);