#include "rtc.h"
#include <Wire.h>
#include <time.h>

// MCP7940M I2C address
#define MCP7940_ADDR  0x6F

// Register addresses
#define REG_SECONDS   0x00  // bit7 = ST (oscillator start)
#define REG_MINUTES   0x01
#define REG_HOURS     0x02  // bit6=12/24, using 24h mode
#define REG_WEEKDAY   0x03  // bit3 = VBATEN (battery enable)
#define REG_DATE      0x04
#define REG_MONTH     0x05
#define REG_YEAR      0x06
#define REG_CONTROL   0x07
#define REG_PWRFAIL   0x03  // power fail flag is in weekday register bit4

static bool rtcOk     = false;
static bool rtcValid  = false;

// ── BCD helpers ──────────────────────────────────────────
static uint8_t toBCD(uint8_t val)   { return ((val / 10) << 4) | (val % 10); }
static uint8_t fromBCD(uint8_t bcd) { return ((bcd >> 4) * 10) + (bcd & 0x0F); }

// ── Raw register read/write ───────────────────────────────
static uint8_t readReg(uint8_t reg) {
  Wire.beginTransmission(MCP7940_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MCP7940_ADDR, (uint8_t)1);
  return Wire.available() ? Wire.read() : 0;
}

static void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MCP7940_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// ── Init ─────────────────────────────────────────────────
void initRTC() {
  Wire.begin(21, 22);  // SDA=GPIO21, SCL=GPIO22

  // Check device is present
  Wire.beginTransmission(MCP7940_ADDR);
  uint8_t err = Wire.endTransmission();
  if (err != 0) {
    Serial.printf("[RTC] MCP7940M not found (I2C err %d). Check wiring.\n", err);
    rtcOk    = false;
    rtcValid = false;
    return;
  }
  rtcOk = true;
  Serial.println("[RTC] MCP7940M found.");

  // Enable battery backup — set VBATEN bit in weekday register
  uint8_t wday = readReg(REG_WEEKDAY);
  writeReg(REG_WEEKDAY, wday | 0x08);

  // Check if oscillator is running — ST bit in seconds register
  uint8_t secs = readReg(REG_SECONDS);
  if (!(secs & 0x80)) {
    Serial.println("[RTC] Oscillator stopped — starting it.");
    writeReg(REG_SECONDS, secs | 0x80);
    rtcValid = false;  // time unknown until NTP sets it
  } else {
    // Check power-fail flag — bit 4 of weekday register
    uint8_t wdayNow = readReg(REG_WEEKDAY);
    if (wdayNow & 0x10) {
      Serial.println("[RTC] Power fail flag set (switched to battery). Clearing flag.");
      // Clear the PWRFAIL bit
      writeReg(REG_WEEKDAY, wdayNow & ~0x10);
    }
    
    // If the oscillator was running, the time is perfectly valid!
    rtcValid = true;
    Serial.println("[RTC] Time is valid from battery backup.");
  }
}

// ── Sync from NTP → write to RTC ─────────────────────────
bool syncRTCFromNTP() {
  if (!rtcOk) return false;

  struct tm t;
  if (!getLocalTime(&t)) {
    Serial.println("[RTC] Cannot sync — NTP time not ready.");
    return false;
  }

  // Stop oscillator before writing (recommended by datasheet)
  uint8_t secs = readReg(REG_SECONDS);
  writeReg(REG_SECONDS, secs & ~0x80);
  delay(5);

  // Write time registers
  writeReg(REG_SECONDS, 0x80 | toBCD(t.tm_sec));       // ST=1 restarts oscillator
  writeReg(REG_MINUTES, toBCD(t.tm_min));
  writeReg(REG_HOURS,   toBCD(t.tm_hour));              // 24h mode, bit6=0
  writeReg(REG_DATE,    toBCD(t.tm_mday));
  writeReg(REG_MONTH,   toBCD(t.tm_mon + 1));
  writeReg(REG_YEAR,    toBCD(t.tm_year % 100));        // last 2 digits of year

  // Re-enable battery backup and clear power-fail flag
  uint8_t wday = readReg(REG_WEEKDAY);
  wday &= ~0x10;   // clear PWRFAIL bit
  wday |=  0x08;   // keep VBATEN set
  writeReg(REG_WEEKDAY, wday);

  rtcValid = true;

  Serial.printf("[RTC] Synced from NTP: %04d-%02d-%02d %02d:%02d:%02d\n",
    t.tm_year + 1900, t.tm_mon + 1, t.tm_mday,
    t.tm_hour, t.tm_min, t.tm_sec);
  return true;
}

// ── Read current time from RTC ────────────────────────────
void getTimeFromRTC(struct tm& t) {
  if (!rtcOk) {
    // Fall back to NTP system time if RTC not available
    getLocalTime(&t);
    return;
  }

  t.tm_sec   = fromBCD(readReg(REG_SECONDS) & 0x7F);   // mask out ST bit
  t.tm_min   = fromBCD(readReg(REG_MINUTES) & 0x7F);
  t.tm_hour  = fromBCD(readReg(REG_HOURS)   & 0x3F);   // mask 12/24 bits
  t.tm_mday  = fromBCD(readReg(REG_DATE)    & 0x3F);
  t.tm_mon   = fromBCD(readReg(REG_MONTH)   & 0x1F) - 1;
  t.tm_year  = fromBCD(readReg(REG_YEAR)) + 100;       // years since 1900, chip stores 00-99
  t.tm_isdst = 0;
}

// ── Formatted output helpers ──────────────────────────────
String getRTCTimestamp() {
  struct tm t; getTimeFromRTC(t);
  char buf[20];
  strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &t);
  return String(buf);
}

String getRTCTimeHHMM() {
  struct tm t; getTimeFromRTC(t);
  char buf[6];
  strftime(buf, sizeof(buf), "%H:%M", &t);
  return String(buf);
}

String getRTCDate() {
  struct tm t; getTimeFromRTC(t);
  char buf[11];
  strftime(buf, sizeof(buf), "%Y-%m-%d", &t);
  return String(buf);
}

bool isRTCValid() { return rtcValid; }