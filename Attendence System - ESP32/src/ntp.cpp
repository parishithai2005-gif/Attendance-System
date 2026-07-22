#include "ntp.h"
#include "rtc.h"
#include "config.h"
#include <time.h>

void initNTP() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET, NTP_SERVER);
  Serial.print("[NTP] Syncing time");
  struct tm timeinfo;
  int attempts = 0;
  while (!getLocalTime(&timeinfo) && attempts < 20) {
    Serial.print(".");
    delay(500);
    attempts++;
  }

  if (getLocalTime(&timeinfo)) {
    Serial.println(" done.");
    syncRTCFromNTP();
  } else {
    Serial.println(" FAILED — will use RTC only.");
  }
}

String getCurrentTimestamp() { return getRTCTimestamp(); }
String getCurrentTimeHHMM()  { return getRTCTimeHHMM();  }
String getCurrentDate()       { return getRTCDate();       }