/*
 * BunBot – Arduino Uno Stroller Controller
 *
 * Two 28BYJ-48 stepper motors via ULN2003 driver boards.
 *   Motor 1 (left):  pins 4, 5, 6, 7
 *   Motor 2 (right): pins 8, 9, 10, 11
 *
 * Connects to the backend over serial (9600 baud, newline-delimited JSON).
 *
 * Receives:  {"cmd":"SET_SPEED","value":1.5}   (m/s, 0-5)
 *            {"cmd":"STOP","value":0}
 *
 * Sends:     {"speed":1.2,"distance":340,"battery":85,"motor":"running"}
 *
 * Install the ArduinoJson library in Arduino IDE:
 *   Sketch → Include Library → Manage Libraries → search "ArduinoJson"
 */

#include <Stepper.h>
#include <ArduinoJson.h>

// ---- Motor setup (28BYJ-48: 2048 steps = 1 full revolution) ----
const int STEPS_PER_REV = 2048;

Stepper motor1(STEPS_PER_REV, 4, 6, 5, 7); // pins reordered for proper sequencing
Stepper motor2(STEPS_PER_REV, 8, 10, 9, 11);

// ---- Wheel geometry (adjust to your stroller) ----
const float WHEEL_CIRCUMFERENCE = 0.5; // meters per wheel revolution
// Gear ratio: if motor shaft connects through gears to the wheel, set this.
// 1.0 = direct drive (motor rev == wheel rev)
const float GEAR_RATIO = 1.0;
const float METERS_PER_STEP = (WHEEL_CIRCUMFERENCE / GEAR_RATIO) / STEPS_PER_REV;

// ---- Battery monitoring (optional, voltage divider on A0) ----
const int BATTERY_PIN = A0;

// ---- State ----
float targetSpeed = 0.0; // m/s requested by webapp
int currentRPM = 0;      // RPM being sent to Stepper library
bool motorRunning = false;
float totalDistance = 0.0; // meters traveled
unsigned long lastReportTime = 0;
unsigned long lastStepTime = 0;
const unsigned long REPORT_INTERVAL = 200; // ms between telemetry reports

// Convert m/s to stepper RPM
int speedToRPM(float speed)
{
    if (speed < 0.01)
        return 0;
    // revs per second = speed / wheel_circumference * gear_ratio
    float rps = (speed * GEAR_RATIO) / WHEEL_CIRCUMFERENCE;
    int rpm = (int)(rps * 60.0);
    return constrain(rpm, 0, 15); // 28BYJ-48 max ~15 RPM
}

void setup()
{
    Serial.begin(9600);
    motor1.setSpeed(5);
    motor2.setSpeed(5);
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
                currentRPM = speedToRPM(targetSpeed);
                motorRunning = currentRPM > 0;
                if (motorRunning)
                {
                    motor1.setSpeed(currentRPM);
                    motor2.setSpeed(currentRPM);
                }
            }
            else if (strcmp(cmd, "STOP") == 0)
            {
                targetSpeed = 0;
                currentRPM = 0;
                motorRunning = false;
            }
        }
    }

    unsigned long now = millis();

    // ---- Step motors ----
    if (motorRunning)
    {
        // Step one step at a time so we can interleave serial reading.
        // The Stepper library blocks during .step(), so we do 1 step
        // per loop iteration to stay responsive.
        motor1.step(1);  // left wheel forward
        motor2.step(-1); // right wheel forward (mirrored)
        totalDistance += METERS_PER_STEP;
    }

    // ---- Report telemetry to backend ----
    if (now - lastReportTime >= REPORT_INTERVAL)
    {
        // Estimate current speed from RPM
        float reportedSpeed = motorRunning
                                  ? (currentRPM / 60.0) * WHEEL_CIRCUMFERENCE / GEAR_RATIO
                                  : 0.0;

        int rawBattery = analogRead(BATTERY_PIN);
        int batteryPct = map(rawBattery, 0, 1023, 0, 100);

        StaticJsonDocument<128> out;
        out["speed"] = round(reportedSpeed * 100) / 100.0;
        out["distance"] = round(totalDistance);
        out["battery"] = batteryPct;
        out["motor"] = motorRunning ? "running" : "idle";

        serializeJson(out, Serial);
        Serial.println();
        lastReportTime = now;
    }
}
