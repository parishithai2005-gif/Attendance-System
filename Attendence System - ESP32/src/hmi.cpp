//hmi.cpp

#include "hmi.h"
#include "config.h"

HardwareSerial hmiSerial(2); // UART2, separate from fingerprint's UART1

// DWIN frames always start with 0x5A 0xA5 (header)
#define DWIN_HEADER_1 0x5A
#define DWIN_HEADER_2 0xA5
#define CMD_WRITE_VP 0x82
#define CMD_READ_VP 0x83

// Most DGUS firmwares use this system VP to force a page jump
#define VP_PAGE_JUMP 0x0084

void initHMI() {
  hmiSerial.begin(HMI_BAUD, SERIAL_8N1, HMI_RX_PIN, HMI_TX_PIN);
  Serial.println("[HMI] UART initialized.");
}

// ─── Low-level frame sender ──────────────────────────────
void sendFrame(uint8_t cmd, uint16_t vp, const uint8_t *data,
                      uint8_t dataLen) {
  uint8_t frame[64];
  int i = 0;
  frame[i++] = DWIN_HEADER_1;
  frame[i++] = DWIN_HEADER_2;
  frame[i++] = 0; // length placeholder, fill below
  frame[i++] = cmd;
  frame[i++] = (vp >> 8) & 0xFF;
  frame[i++] = vp & 0xFF;

  for (int j = 0; j < dataLen; j++)
    frame[i++] = data[j];

  frame[2] = i - 3; // length = everything after the length byte itself
  hmiSerial.write(frame, i);
}

void hmiGoToScreen(uint16_t screenId) {
  // DGUS T5L requires writing 0x5A01 followed by the page ID to 0x0084
  uint8_t data[4] = {0x5A, 0x01, (uint8_t)(screenId >> 8), (uint8_t)(screenId & 0xFF)};
  sendFrame(CMD_WRITE_VP, VP_PAGE_JUMP, data, 4);
}

void hmiWriteValue(uint16_t vpAddr, uint16_t value) {
  uint8_t data[2] = {(uint8_t)(value >> 8), (uint8_t)(value & 0xFF)};
  sendFrame(CMD_WRITE_VP, vpAddr, data, 2);
}

// DWIN text VPs expect ASCII/GBK bytes, null-padded to an even length
void hmiWriteText(uint16_t vpAddr, const String &text) {
  uint8_t data[32] = {0};
  int len = min((int)text.length(), 30);
  for (int i = 0; i < len; i++)
    data[i] = text[i];
  if (len % 2 != 0)
    len++; // DWIN wants even byte count
  sendFrame(CMD_WRITE_VP, vpAddr, data, len);
}

// ─── Reading touch/VP change events from the HMI ─────────
// DWIN sends an unsolicited frame when a touch-linked VP changes:
// 5A A5 LEN 83 addrH addrL 01 valH valL
bool hmiReadEvent(HmiEvent &evt) {
  static uint8_t buf[128];
  static int idx = 0;

  while (hmiSerial.available()) {
    uint8_t b = hmiSerial.read();

    if (idx == 0 && b != DWIN_HEADER_1)
      continue;
    if (idx == 1 && b != DWIN_HEADER_2) {
      idx = 0;
      continue;
    }

    buf[idx++] = b;

    if (idx >= 3) {
      uint8_t frameLen = buf[2];
      // full frame = header(2) + lenByte(1) + frameLen bytes
      if (idx == frameLen + 3) {
        idx = 0; // reset for next frame

        if (buf[3] == CMD_READ_VP || buf[3] == CMD_WRITE_VP) {
          uint16_t vp = (buf[4] << 8) | buf[5];
          int dataWords = buf[6];
          int byteCount = dataWords * 2;
          
          evt.vp = vp;
          if (byteCount == 2) {
            evt.value = (buf[7] << 8) | buf[8];
          } else {
            evt.value = 0;
          }

          // Parse as string
          String s = "";
          for (int k = 0; k < byteCount; k++) {
            char c = buf[7 + k];
            if (c == 0 || c == 0xFF) break;
            s += c;
          }
          evt.textValue = s;
          
          return true;
        }
      }
      if (idx >= sizeof(buf))
        idx = 0; // safety reset, malformed frame
    }
  }
  return false;
}