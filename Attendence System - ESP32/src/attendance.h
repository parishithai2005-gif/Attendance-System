//attendance.h

#pragma once
#include <Arduino.h>
#include <map>

enum AttendanceMode { ABSENT, WORKING, ON_DUTY };
enum PunchType { PUNCH_IN, PUNCH_OUT, PUNCH_ONDUTY_LEAVE, PUNCH_ONDUTY_RETURN };

struct EmployeeState {
  String      id;
  String      name;
  AttendanceMode mode = ABSENT;
  String      lastPunchTime;
  bool        isLate = false;
};

extern std::map<String, EmployeeState> employeeStates;

PunchType resolvePunch(EmployeeState& emp, String currentTime);
