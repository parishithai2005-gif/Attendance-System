//network.cpp

#include "network.h"
#include "config.h"
#include <WiFi.h>

void initNetwork() {
  Serial.print("[NET] Connecting to WiFi ");
  
  for (int retry = 0; retry < 3; retry++) {
    WiFi.disconnect(true);
    delay(100);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println(" CONNECTED!");
      Serial.print("[NET] IP: ");
      Serial.println(WiFi.localIP());
      return; // Success!
    }
    
    if (retry < 2) {
      Serial.print(" Retry... ");
    }
  }
  
  Serial.println(" FAILED completely!");
}
