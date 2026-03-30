import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.SOCKET_URL ?? "http://127.0.0.1:4000";

export function createTestSocket(): Socket {

  return io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
  });
}

export const connectSocket = createTestSocket;