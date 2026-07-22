//ntp.h

#pragma once
#include <Arduino.h>

void initNTP();
String getCurrentTimestamp();
String getCurrentTimeHHMM();
String getCurrentDate();
