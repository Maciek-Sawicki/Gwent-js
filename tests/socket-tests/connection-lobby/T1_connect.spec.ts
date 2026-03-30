import { test, expect } from '@playwright/test'
import { Socket } from 'socket.io-client'
import { connectSocket } from './connectSocket'

test('T1 - client connects to socket server', async () => {
  let socket: Socket | null = null

  try {
    socket = connectSocket()

    await new Promise<void>((resolve, reject) => {
      socket!.once('connect', () => resolve())
      socket!.once('connect_error', (err: any) =>
        reject(new Error(`connect_error: ${String(err)}`)),
      )
    })

    expect(socket.connected).toBeTruthy()
    expect(typeof socket.id).toBe('string')
    expect(socket.id.length).toBeGreaterThan(0)
  } finally {
    socket?.disconnect()
  }
})