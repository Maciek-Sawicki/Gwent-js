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

async function waitForStateWithBothPlayers(socket: Socket, timeoutMs = 5000) {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for state_update (both players)')),
      timeoutMs,
    )

    const handler = (state: any) => {
      const players = state?.players ?? []
      const p1 = players.find((p: any) => p.id === 'p1')
      const p2 = players.find((p: any) => p.id === 'p2')
      if (p1?.socketId && p2?.socketId) {
        clearTimeout(t)
        socket.off('state_update', handler)
        resolve(state)
      }
    }

    socket.on('state_update', handler)
  })
}

test('T2 - two players can join the same game', async () => {
  const gameId = generateGameId()
  const socket1 = connectSocket()
  const socket2 = connectSocket()

  try {
    await Promise.all([waitForConnect(socket1), waitForConnect(socket2)])

    const p1Promise = waitForYouArePlayer(socket1)
    const p2Promise = waitForYouArePlayer(socket2)
    const statePromise = waitForStateWithBothPlayers(socket1)

    socket1.emit('join_game', { gameId })
    socket2.emit('join_game', { gameId })

    const [playerId1, playerId2, state] = await Promise.all([
      p1Promise,
      p2Promise,
      statePromise,
    ])
    expect([playerId1, playerId2].sort()).toEqual(['p1', 'p2'])
    const players = state?.players ?? []
    expect(players.length).toBe(2)
  } finally {
    socket1.disconnect()
    socket2.disconnect()
  }
})