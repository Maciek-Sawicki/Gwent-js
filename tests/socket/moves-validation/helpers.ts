import type { Socket } from 'socket.io-client'

import { connectSocket } from '../connection-lobby/connectSocket'

export function generateGameId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function waitForConnect(socket: Socket, timeoutMs = 5000) {
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

export async function waitForError(
  socket: Socket,
  timeoutMs = 5000,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for socket error event')),
      timeoutMs,
    )

    socket.once('error', (err: any) => {
      clearTimeout(t)
      resolve(String(err))
    })
  })
}

export async function waitForState(
  socket: Socket,
  predicate: (state: any) => boolean,
  timeoutMs = 10000,
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for state_update matching predicate')),
      timeoutMs,
    )

    const handler = (state: any) => {
      if (predicate(state)) {
        clearTimeout(t)
        socket.off('state_update', handler)
        resolve(state)
      }
    }

    socket.on('state_update', handler)
  })
}

export async function setupTwoPlayerGame(
  gameId: string = generateGameId(),
): Promise<{
  gameId: string
  p1Socket: Socket
  p2Socket: Socket
  state: any
}> {
  const socket1 = connectSocket()
  const socket2 = connectSocket()

  try {
    await Promise.all([waitForConnect(socket1), waitForConnect(socket2)])

    const playerId1Promise = new Promise<string>((resolve) => {
      socket1.once('you_are_player', (payload: any) => resolve(String(payload.playerId)))
    })
    const playerId2Promise = new Promise<string>((resolve) => {
      socket2.once('you_are_player', (payload: any) => resolve(String(payload.playerId)))
    })

    const readyStatePromise = waitForState(
      socket1,
      (s) => {
        const players = s?.players ?? []
        return (
          s?.status === 'IN_PROGRESS' &&
          players.length === 2 &&
          players.every((p: any) => Array.isArray(p.hand) && p.hand.length > 0) &&
          (s.currentPlayer === 'p1' || s.currentPlayer === 'p2')
        )
      },
      15000,
    )

    socket1.emit('join_game', { gameId })
    socket2.emit('join_game', { gameId })

    const [playerId1, playerId2, state] = await Promise.all([
      playerId1Promise,
      playerId2Promise,
      readyStatePromise,
    ])

    const p1Socket = playerId1 === 'p1' ? socket1 : socket2
    const p2Socket = playerId1 === 'p1' ? socket2 : socket1

    return { gameId, p1Socket, p2Socket, state }
  } catch (e) {
    socket1.disconnect()
    socket2.disconnect()
    throw e
  }
}

