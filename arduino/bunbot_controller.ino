/*
 * BunBot – Arduino Uno Stroller Controller
 *
 * Connects to the backend over serial (9600 baud, newline-delimited JSON).
 *
 * Receives:  {"cmd":"SET_SPEED","value":1.5}
 *            {"cmd":"STOP","value":0}
 *
 * Sends:     {"speed":1.2,"distance":340,"battery":85,"motor":"running"}
 *
 * Hardware:
 *   - Motor driver (e.g. L298N) on pins 9 (PWM), 8 (DIR)
 *   - Hall-effect wheel encoder on pin 2 (interrupt)
 *   - Battery voltage divider on A0
 */

#include <ArduinoJson.h>

// ---- Pin definitions ----
const int MOTOR_PWM_PIN = 9;
const int MOTOR_DIR_PIN = 8;
const int ENCODER_PIN = 2;
const int BATTERY_PIN = A0;

// ---- Wheel geometry ----
const float WHEEL_CIRCUMFERENCE = 0.5; // meters (adjust to your stroller wheel)
const int ENCODER_TICKS_PER_REV = 20;  // depends on encoder disc

// ---- State ----
volatile unsigned long encoderTicks = 0;
unsigned long lastReportTime = 0;
unsigned long lastSpeedCalcTime = 0;
unsigned long lastTicks = 0;
float currentSpeed = 0.0;  // m/s
float totalDistance = 0.0; // meters
float targetSpeed = 0.0;   // m/s
bool motorRunning = false;
const unsigned long REPORT_INTERVAL = 200; // ms

void encoderISR()
{
    encoderTicks++;
}

void setup()
{
    Serial.begin(9600);
    pinMode(MOTOR_PWM_PIN, OUTPUT);
    pinMode(MOTOR_DIR_PIN, OUTPUT);
    pinMode(ENCODER_PIN, INPUT_PULLUP);

    attachInterrupt(digitalPinToInterrupt(ENCODER_PIN), encoderISR, RISING);

    digitalWrite(MOTOR_DIR_PIN, HIGH); // forward
    analogWrite(MOTOR_PWM_PIN, 0);
}

void loop()
{
    // ---- Read commands from serial ----
    if (Serial.available())
    {
        String line = Serial.readStringUntil('\n');
        StaticJsonDocument<128> doc;
        if (deserializeJson(doc, line) == DeserializationError::Ok)
        {
            const char *cmd = doc["cmd"];
            float value = doc["value"];

            if (strcmp(cmd, "SET_SPEED") == 0)
            {
                targetSpeed = constrain(value, 0.0, 5.0);
                motorRunning = targetSpeed > 0.01;
            }
            else if (strcmp(cmd, "STOP") == 0)
            {
                targetSpeed = 0;
                motorRunning = false;
                analogWrite(MOTOR_PWM_PIN, 0);
            }
        }
    }

    unsigned long now = millis();

    // ---- Compute speed from encoder ----
    if (now - lastSpeedCalcTime >= 100)
    {
        noInterrupts();
        unsigned long ticks = encoderTicks;
        interrupts();

        unsigned long dt = now - lastSpeedCalcTime;
        unsigned long dTicks = ticks - lastTicks;
        float revolutions = (float)dTicks / ENCODER_TICKS_PER_REV;
        float distDelta = revolutions * WHEEL_CIRCUMFERENCE;
        currentSpeed = distDelta / (dt / 1000.0);
        totalDistance += distDelta;
        lastTicks = ticks;
        lastSpeedCalcTime = now;
    }

    // ---- Simple proportional motor control ----
    if (motorRunning)
    {
        float error = targetSpeed - currentSpeed;
        int pwm = constrain((int)(error * 80 + targetSpeed * 40), 0, 255);
        analogWrite(MOTOR_PWM_PIN, pwm);
    }

    // ---- Report data to backend ----
    if (now - lastReportTime >= REPORT_INTERVAL)
    {
        int rawBattery = analogRead(BATTERY_PIN);
        int batteryPct = map(rawBattery, 0, 1023, 0, 100);

        StaticJsonDocument<128> out;
        out["speed"] = round(currentSpeed * 100) / 100.0;
        out["distance"] = round(totalDistance);
        out["battery"] = batteryPct;
        out["motor"] = motorRunning ? "running" : "idle";

        serializeJson(out, Serial);
        Serial.println();
        lastReportTime = now;
    }
}
