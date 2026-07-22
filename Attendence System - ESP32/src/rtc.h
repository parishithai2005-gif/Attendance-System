#pragma once
#include <Arduino.h>

void   initRTC();
bool   syncRTCFromNTP();
void   getTimeFromRTC(struct tm& t);
String getRTCTimestamp();
String getRTCTimeHHMM();
String getRTCDate();
bool   isRTCValid();