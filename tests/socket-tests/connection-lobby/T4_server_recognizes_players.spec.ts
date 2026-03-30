import { test, expect } from '@playwright/test'
import { Socket } from 'socket.io-client'
import { connectSocket } from './connectSocket'

function generateGameId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function waitForConnect(socket: Socket, timeoutMs = 5000) {
  if (socket.connected) return

  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for socket connect')),
      timeoutMs,
    )

    socket.once('connect', () => {
      clearTimeout(t)
      resolve()
    })
    socket.once('connect_error', (err: any) => {
      clearTimeout(t)
      reject(new Error(`connect_error: ${String(err)}`))
    })
  })
}

async function waitForStateWithBothSocketIds(
  socket: Socket,
  socketId1: string,
  socketId2: string,
  timeoutMs = 5000,
) {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(
      () =>
        reject(new Error('timeout waiting for state_update (both socket ids)')),
      timeoutMs,
    )

    const handler = (state: any) => {
      const players = state?.players ?? []
      if (players.length !== 2) return

      const has1 = players.some((p: any) => p.socketId === socketId1)
      const has2 = players.some((p: any) => p.socketId === socketId2)

      if (has1 && has2) {
        clearTimeout(t)
        socket.off('state_update', handler)
        resolve(state)
      }
    }

    socket.on('state_update', handler)
  })
}

test('T4 - server recognizes both players', async () => {
  const gameId = generateGameId()
  const socket1 = connectSocket()
  const socket2 = connectSocket()

  try {
    await Promise.all([waitForConnect(socket1), waitForConnect(socket2)])

    socket1.emit('join_game', { gameId })
    socket2.emit('join_game', { gameId })

    const state = await waitForStateWithBothSocketIds(
      socket1,
      socket1.id,
      socket2.id,
    )

    const players = state?.players ?? []
    expect(players.length).toBe(2)

    const playerIds = players.map((p: any) => p.id)
    expect(playerIds).toEqual(expect.arrayContaining(['p1', 'p2']))
  } finally {
    socket1.disconnect()
    socket2.disconnect()
  }
})
