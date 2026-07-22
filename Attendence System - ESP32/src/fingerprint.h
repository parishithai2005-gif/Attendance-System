// fingerprint.h

#pragma once
#include "config.h"
#include <Adafruit_Fingerprint.h>
#include <Arduino.h>

// ── LED color constants ───────────────────────────────────
#define FP_LED_RED 1
#define FP_LED_BLUE 2
#define FP_LED_PURPLE 3
#define FP_LED_GREEN 4
#define FP_LED_YELLOW 5
#define FP_LED_CYAN 6
#define FP_LED_WHITE 7

// ── LED mode constants ────────────────────────────────────
#define FP_LED_MODE_BREATH 1
#define FP_LED_MODE_BLINK 2
#define FP_LED_MODE_ON 3
#define FP_LED_MODE_OFF 4
#define FP_LED_MODE_GRAD_ON 5
#define FP_LED_MODE_GRAD_OFF 6

// ── Extern declarations (defined once in fingerprint.cpp) ─
extern HardwareSerial fpSerial;
extern Adafruit_Fingerprint finger;

// ── Function declarations ─────────────────────────────────
bool initFingerprint();
bool enrollFingerprint(uint8_t id);
int verifyFingerprint();
uint8_t getFingerprintCount();
int findNextFreeSlot();
bool deleteFingerprint(uint8_t id);
bool clearFingerprintDatabase();

void fpLedOn(uint8_t color);
void fpLedOff();
void fpLedBlink(uint8_t color, uint8_t times);
void fpLedBreath(uint8_t color);