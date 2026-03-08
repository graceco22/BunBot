import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { EventEmitter } from "events";

export interface StrollerData {
  speed: number; // m/s
  distance: number; // meters
  batteryLevel: number; // percentage
  motorStatus: "idle" | "running" | "error";
  timestamp: number;
}

/**
 * Communicates with the Arduino Uno over serial.
 * Protocol (newline-delimited JSON both directions):
 *   Arduino -> Server:  {"speed":1.2,"distance":340,"battery":85,"motor":"running"}
 *   Server  -> Arduino: {"cmd":"SET_SPEED","value":1.5}
 */
export class ArduinoService extends EventEmitter {
  private static instance: ArduinoService;
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private connected = false;
  private latestData: StrollerData = {
    speed: 0,
    distance: 0,
    batteryLevel: 100,
    motorStatus: "idle",
    timestamp: Date.now(),
  };

  private constructor() {
    super();
  }

  static getInstance(): ArduinoService {
    if (!ArduinoService.instance) {
      ArduinoService.instance = new ArduinoService();
    }
    return ArduinoService.instance;
  }

  async connect(
    portPath?: string,
    baudRate?: number
  ): Promise<{ success: boolean; error?: string }> {
    // Clean up any stale connection first
    this.disconnect();
    // Small delay to let the OS release the port
    await new Promise((r) => setTimeout(r, 300));

    const path = portPath || process.env.ARDUINO_PORT || "/dev/tty.usbmodem1101";
    const baud = baudRate || Number(process.env.ARDUINO_BAUD_RATE) || 9600;

    return new Promise((resolve) => {
      try {
        this.port = new SerialPort({ path, baudRate: baud, autoOpen: false });
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

        this.port.on("error", (err) => {
          console.error("Serial port error:", err.message);
          this.connected = false;
        });

        this.port.open((err) => {
          if (err) {
            this.connected = false;
            resolve({ success: false, error: err.message });
            return;
          }
          this.connected = true;
          this.listenForData();
          console.log(`Arduino connected on ${path} @ ${baud}`);
          resolve({ success: true });
        });

        this.port.on("close", () => {
          this.connected = false;
          this.emit("disconnected");
        });
      } catch (err: any) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  disconnect(): void {
    try {
      if (this.port?.isOpen) {
        this.port.close();
      }
    } catch {
      // ignore close errors on stale ports
    }
    this.port = null;
    this.parser = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLatestData(): StrollerData {
    return { ...this.latestData };
  }

  /** Send a target speed (m/s) to the Arduino motor controller. */
  setSpeed(speed: number): void {
    this.sendCommand("SET_SPEED", speed);
  }

  /** Emergency stop. */
  stop(): void {
    this.sendCommand("STOP", 0);
  }

  /** List available serial ports. */
  static async listPorts(): Promise<string[]> {
    const ports = await SerialPort.list();
    return ports.map((p) => p.path);
  }

  // ---- private ----

  private sendCommand(cmd: string, value: number): void {
    if (!this.port?.isOpen) {
      console.warn(`sendCommand(${cmd}) ignored — port not open`);
      return;
    }
    const msg = JSON.stringify({ cmd, value }) + "\n";
    this.port.write(msg, (err) => {
      if (err) {
        console.error(`Serial write error: ${err.message}`);
      }
    });
  }

  private listenForData(): void {
    this.parser?.on("data", (line: string) => {
      try {
        const raw = JSON.parse(line);
        this.latestData = {
          speed: raw.speed ?? 0,
          distance: raw.distance ?? 0,
          batteryLevel: raw.battery ?? 100,
          motorStatus: raw.motor ?? "idle",
          timestamp: Date.now(),
        };
        this.emit("data", this.latestData);
      } catch {
        // ignore malformed lines
      }
    });
  }
}
