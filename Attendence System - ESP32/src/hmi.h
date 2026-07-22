//hmi.h

#pragma once
#include <Arduino.h>

struct HmiEvent {
  uint16_t vp; // VP address that changed
  int value;   // numeric value read
  String textValue; // string text read (if it's an ASCII text VP)
};

void initHMI();
void hmiGoToScreen(uint16_t screenId);
void hmiWriteText(uint16_t vpAddr, const String &text);
void hmiWriteValue(uint16_t vpAddr, uint16_t value);
bool hmiReadEvent(
    HmiEvent &evt); // non-blocking poll, true if a touch/VP event arrived

extern HardwareSerial hmiSerial;
void sendFrame(uint8_t cmd, uint16_t vp, const uint8_t *data, uint8_t dataLen);