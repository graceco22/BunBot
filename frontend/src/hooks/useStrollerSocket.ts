import { useEffect, useRef, useState, useCallback } from "react";
import type { StrollerData } from "../api/client";

interface WSMessage {
  type: string;
  payload: StrollerData;
}

export function useStrollerSocket() {
  const [data, setData] = useState<StrollerData | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data);
        if (msg.type === "stroller_data") {
          setData(msg.payload);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendSpeed = useCallback((speed: number) => {
    wsRef.current?.send(JSON.stringify({ type: "set_speed", speed }));
  }, []);

  const sendStop = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "stop" }));
  }, []);

  return { data, connected, sendSpeed, sendStop };
}
