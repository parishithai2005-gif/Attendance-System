// registration.cpp
#include "registration.h"
#include "fingerprint.h"
#include "sheets.h"
#include "employees.h"

// findNextFreeSlot moved to fingerprint.cpp

// Read a line from Serial Monitor with echo, backspace, and robust line-ending handling
String readSerialLine() {
  String input = "";
  while (true) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == '\r' || c == '\n') {
        // Discard the matching part of a CRLF pair to prevent residue in buffer
        delay(5);
        if (Serial.available()) {
          char next = Serial.peek();
          if ((c == '\r' && next == '\n') || (c == '\n' && next == '\r')) {
            Serial.read(); // Discard the matching second half
          }
        }
        break; // Exit loop on Enter key (allows empty string submission to cancel)
      } else if (c == 8 || c == 127) { // Backspace or Delete key
        if (input.length() > 0) {
          input.remove(input.length() - 1);
          Serial.print("\b \b"); // Move cursor back, overwrite with space, move back again
        }
      } else {
        input += c;
        Serial.print(c); // Echo character back to user
      }
    }
    delay(10);
  }
  input.trim();
  return input;
}

bool runRegistrationFlow() {
  Serial.println("\n=================================");
  Serial.println("   NEW EMPLOYEE REGISTRATION");
  Serial.println("=================================");

  Serial.print("Enter Employee ID: ");
  String employeeId = readSerialLine();
  employeeId.trim();
  Serial.println(); // Print newline after user inputs
  
  if (employeeId.length() == 0) {
    Serial.println("[REG]  Cancelled (empty ID).");
    return false;
  }

  // Find next available fingerprint slot
  int slot = findNextFreeSlot();
  if (slot == -1) {
    Serial.println("[REG]  ERROR: Fingerprint sensor is full!");
    return false;
  }
  Serial.printf("[REG]  Assigning fingerprint slot: %d\n", slot);

  // Enroll fingerprint (two-scan confirm)
  Serial.println("[REG]  Starting fingerprint enrollment...");
  bool enrolled = enrollFingerprint(slot);

  if (!enrolled) {
    Serial.println("[REG]  ERROR: Fingerprint enrollment failed. Try again.");
    return false;
  }

  Serial.println("[REG]  Fingerprint enrolled in sensor. Syncing with Google Sheets...");
  
  // Push to Google Sheets via registerFingerprint action
  bool sheetOk = sendRegisterFingerprint(employeeId, String(slot));

  if (sheetOk) {
    // Refresh employee cache so this slot is active immediately
    syncEmployeesFromSheet();

    Serial.println("=================================");
    Serial.println("   REGISTRATION SUCCESSFUL");
    Serial.printf("   Employee ID : %s\n", employeeId.c_str());
    Serial.printf("   FP Slot     : %d\n", slot);
    Serial.println("=================================\n");
    return true;
  } else {
    Serial.println("[REG]  ERROR: Could not map fingerprint in Google Sheets.");
    Serial.println("[REG]  Deleting fingerprint from sensor memory to prevent orphans...");
    deleteFingerprint(slot);
    return false;
  }
}