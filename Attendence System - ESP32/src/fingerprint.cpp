// fingerprint.cpp

#include "fingerprint.h"

// Declared once only
HardwareSerial fpSerial(1);
Adafruit_Fingerprint finger(&fpSerial);

// ── LED Control
// ───────────────────────────────────────────────────────────────

void fpLedOn(uint8_t color) { finger.LEDcontrol(FP_LED_MODE_ON, 0, color, 0); }

void fpLedOff() { finger.LEDcontrol(FP_LED_MODE_OFF, 0, 0, 0); }

void fpLedBlink(uint8_t color, uint8_t times) {
  finger.LEDcontrol(FP_LED_MODE_BLINK, 30, color, times);
}

void fpLedBreath(uint8_t color) {
  finger.LEDcontrol(FP_LED_MODE_BREATH, 20, color, 0);
}

// ── Init
// ──────────────────────────────────────────────────────────────────────

bool initFingerprint() {
  fpSerial.begin(FP_BAUD, SERIAL_8N1, FP_RX_PIN, FP_TX_PIN);
  finger.begin(FP_BAUD);
  delay(500);

  if (finger.verifyPassword()) {
    Serial.println("[FP]   Sensor found and password verified.");
    finger.getParameters();
    finger.getTemplateCount();
    Serial.printf("[FP]   Templates stored: %d / %d\n", finger.templateCount,
                  finger.capacity);
    return true;
  } else {
    Serial.println("[FP]   ERROR: Sensor not found. Check wiring.");
    return false;
  }
}

// ── Enroll
// ────────────────────────────────────────────────────────────────────

bool enrollFingerprint(uint8_t id) {
  Serial.printf("[FP]   Starting enrollment for slot %d\n", id);
  int p = -1;

  Serial.println("[FP]   Place finger on sensor...");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER)
      continue;
    if (p == FINGERPRINT_IMAGEFAIL) {
      Serial.println("[FP]   Imaging error.");
      return false;
    }
  }
  Serial.println("[FP]   Image 1 captured.");
  if (finger.image2Tz(1) != FINGERPRINT_OK) {
    Serial.println("[FP]   Convert failed.");
    return false;
  }

  Serial.println("[FP]   Remove finger...");
  delay(2000);
  while (finger.getImage() != FINGERPRINT_NOFINGER)
    delay(200);

  Serial.println("[FP]   Place same finger again...");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER)
      continue;
    if (p == FINGERPRINT_IMAGEFAIL) {
      Serial.println("[FP]   Imaging error.");
      return false;
    }
  }
  Serial.println("[FP]   Image 2 captured.");
  if (finger.image2Tz(2) != FINGERPRINT_OK) {
    Serial.println("[FP]   Convert failed.");
    return false;
  }

  if (finger.createModel() != FINGERPRINT_OK) {
    Serial.println("[FP]   Prints did not match.");
    return false;
  }
  if (finger.storeModel(id) != FINGERPRINT_OK) {
    Serial.println("[FP]   Store failed.");
    return false;
  }

  Serial.printf("[FP]   Enrolled at slot %d.\n", id);
  return true;
}

// ── Verify
// ────────────────────────────────────────────────────────────────────

static int fpErrorCount = 0;

int verifyFingerprint() {
  int p = finger.getImage();
  
  if (p == FINGERPRINT_NOFINGER || p == FINGERPRINT_OK) {
    fpErrorCount = 0; // Communication is healthy
    if (p == FINGERPRINT_NOFINGER) return -1;
  } else {
    // Communication error, timeout, or sensor brownout
    fpErrorCount++;
    if (fpErrorCount > 5) {
      Serial.println("[FP] Sensor unresponsive. Re-initializing...");
      if (initFingerprint()) {
        fpLedBreath(FP_LED_BLUE);
      }
      fpErrorCount = 0;
    }
    return -1;
  }

  if (finger.image2Tz() != FINGERPRINT_OK)
    return -1;
  if (finger.fingerSearch() != FINGERPRINT_OK)
    return -1;

  Serial.printf("[FP]   Match! ID: %d  Confidence: %d\n", finger.fingerID,
                finger.confidence);
  return finger.fingerID;
}

// ── Utilities
// ─────────────────────────────────────────────────────────────────

uint8_t getFingerprintCount() {
  finger.getTemplateCount();
  return finger.templateCount;
}

int findNextFreeSlot() {
  int capacity = (finger.capacity > 0) ? finger.capacity : 127;
  for (int i = 1; i <= capacity; i++) {
    if (finger.loadModel(i) != FINGERPRINT_OK) {
      return i;  // this slot is empty
    }
  }
  return -1;  // sensor full
}

bool deleteFingerprint(uint8_t id) {
  if (finger.deleteModel(id) == FINGERPRINT_OK) {
    Serial.printf("[FP]   Deleted slot %d.\n", id);
    return true;
  }
  Serial.printf("[FP]   Failed to delete slot %d.\n", id);
  return false;
}

bool clearFingerprintDatabase() {
  if (finger.emptyDatabase() == FINGERPRINT_OK) {
    Serial.println("[FP]   All fingerprint records deleted successfully!");
    return true;
  }
  Serial.println("[FP]   Failed to clear fingerprint sensor database.");
  return false;
}