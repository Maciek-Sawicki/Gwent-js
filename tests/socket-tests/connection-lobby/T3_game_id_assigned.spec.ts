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

async function waitForYouArePlayer(socket: Socket, timeoutMs = 5000) {
  return new Promise<string>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for you_are_player')),
      timeoutMs,
    )

    const handler = (payload: any) => {
      clearTimeout(t)
      socket.off('you_are_player', handler)
      resolve(String(payload.playerId))
    }

    socket.on('you_are_player', handler)
  })
}

async function waitForMyState(socket: Socket, timeoutMs = 5000) {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for state_update for my player')),
      timeoutMs,
    )

    const handler = (state: any) => {
      const players = state?.players ?? []
      const me = players.find((p: any) => p.socketId === socket.id)
      if (me?.socketId) {
        clearTimeout(t)
        socket.off('state_update', handler)
        resolve(state)
      }
    }

    socket.on('state_update', handler)
  })
}

test('T3 - gameId is used for joining the correct room', async () => {
  const gameId = generateGameId()
  const socket = connectSocket()

  try {
    await waitForConnect(socket)

    const playerIdPromise = waitForYouArePlayer(socket)
    const myStatePromise = waitForMyState(socket)
    socket.emit('join_game', { gameId })
    const [playerId, state] = await Promise.all([playerIdPromise, myStatePromise])

    expect(['p1', 'p2']).toContain(playerId)
    const me = (state?.players ?? []).find((p: any) => p.socketId === socket.id)
    expect(me?.id).toBe(playerId)

    const rooms = (socket as any).rooms
    if (rooms && typeof rooms.has === 'function') {
      await expect.poll(
        () => Boolean(rooms.has(gameId)),
        { timeout: 5000 },
      ).toBeTruthy()
    }
  } finally {
    socket.disconnect()
  }
})
