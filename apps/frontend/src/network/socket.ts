import { io, Socket } from "socket.io-client"

// Socket nie łączy się automatycznie - tylko gdy użytkownik dołączy do gry
let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io("http://localhost:4000", {
      autoConnect: false, // Nie łącz się automatycznie
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