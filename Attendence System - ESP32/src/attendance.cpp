//attendance.cpp

#include "attendance.h"
#include "config.h"

std::map<String, EmployeeState> employeeStates;

PunchType resolvePunch(EmployeeState& emp, String currentTime) {
  // basic HH:MM compare
  String shiftStartStr = String(SHIFT_START_HOUR < 10 ? "0" : "") + String(SHIFT_START_HOUR) + ":" + String(SHIFT_START_MINUTE < 10 ? "0" : "") + String(SHIFT_START_MINUTE);
  
  if (emp.mode == ABSENT) {
    emp.mode = WORKING;
    emp.isLate = (currentTime > shiftStartStr);
    emp.lastPunchTime = currentTime;
    return PUNCH_IN;
  } else if (emp.mode == WORKING) {
    emp.mode = ON_DUTY;
    emp.lastPunchTime = currentTime;
    return PUNCH_ONDUTY_LEAVE;
  } else if (emp.mode == ON_DUTY) {
    emp.mode = WORKING;
    emp.lastPunchTime = currentTime;
    return PUNCH_ONDUTY_RETURN;
  }
  emp.lastPunchTime = currentTime;
  return PUNCH_OUT;
}
