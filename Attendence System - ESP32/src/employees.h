//employees.h

#pragma once
#include <Arduino.h>

struct Employee {
  String id;
  String name;
  String password;
  String dob; // "YYYY-MM-DD"
  String gender;
  String dateOfJoining;
  int fpSlot; // fingerprint sensor storage slot (1-127)
};

#define MAX_EMPLOYEES 127

void initEmployeeStore();
bool syncEmployeesFromSheet();       // pulls master list via HTTP GET
bool addEmployeeLocally(Employee e); // called after successful enrollment
Employee *findEmployeeById(String id);
Employee *findEmployeeByFpSlot(int slot);
int getEmployeeCount();
void saveEmployeesToFlash();
void loadEmployeesFromFlash();