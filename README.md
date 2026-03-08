# BunBot 🐇

A pacing stroller companion that connects to an Arduino Uno to help runners train smarter. The stroller moves alongside you at your target pace, gives real-time run insights, and helps you build training plans.

## Architecture

```
┌─────────────┐   Serial/USB    ┌──────────────┐   WebSocket/REST   ┌──────────────┐
│  Arduino Uno │ ◄──────────── │   Backend     │ ◄──────────────── │   Frontend    │
│  (Motor +    │   JSON lines   │  Express +TS  │                    │  React + Vite │
│   Encoder)   │                │  port 3001    │                    │  port 5173    │
└─────────────┘                └──────────────┘                    └──────────────┘
```

## Features

- **Stroller Control** — Connect to the Arduino, set target speed, emergency stop
- **Live Telemetry** — Real-time speed, distance, battery via WebSocket
- **Run Sessions** — Start/stop runs, track pace, get per-km splits
- **Run Insights** — Average pace, max speed, consistency score
- **Training Plans** — Generate week-by-week plans for 5K → Marathon goals

## Getting Started

### Prerequisites

- Node.js 18+
- Arduino Uno with motor driver, encoder, and the sketch uploaded
- ArduinoJson library installed in Arduino IDE

### 1. Upload the Arduino Sketch

Open `arduino/bunbot_controller.ino` in the Arduino IDE, install the **ArduinoJson** library, and upload to your Uno.

### 2. Start the Backend

```bash
cd backend
cp .env.example .env   # edit ARDUINO_PORT to match your board
npm run dev
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
bunbot/
├── arduino/                  # Arduino Uno sketch
│   └── bunbot_controller.ino
├── backend/
│   └── src/
│       ├── index.ts          # Express + WS server entry
│       ├── routes/
│       │   ├── arduino.ts    # /api/arduino/* endpoints
│       │   ├── run.ts        # /api/run/* endpoints
│       │   └── training.ts   # /api/training/* endpoints
│       ├── services/
│       │   ├── arduino.ts    # Serial port communication
│       │   └── websocket.ts  # Real-time data relay
│       ├── models/           # TypeScript interfaces
│       └── utils/            # Insights computation
├── frontend/
│   └── src/
│       ├── api/client.ts     # API + type definitions
│       ├── hooks/            # useStrollerSocket
│       ├── pages/            # Dashboard, StrollerControl, RunSession, TrainingPlans, RunHistory
│       └── components/       # Navbar
└── README.md
```
