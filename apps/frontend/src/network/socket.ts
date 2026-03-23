import { io, Socket } from "socket.io-client"

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000"

// Socket nie łączy się automatycznie - tylko gdy użytkownik dołączy do gry
let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false, // Nie łącz się automatycznie
      transports: ["websocket", "polling"],
    })
  }
  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect()
  }
}

// Dla kompatybilności wstecznej
export const socket = getSocket()