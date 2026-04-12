import { test, expect } from '@playwright/test'

import { connectSocket } from '../connection-lobby/connectSocket'
import {
  publicBoardSnapshot,
  setupTwoPlayerGame,
  waitForConnect,
  waitForState,
} from '../moves-validation/helpers'

test('T51 - Reconnected player receives current game state', async () => {
  const game = await setupTwoPlayerGame()

  const { gameId, p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  let newP1: ReturnType<typeof connectSocket> | null = null

  try {
    p1Socket.emit('play_card', { cardId: card!.id, row })
    const afterPlay = await waitForState(
      p1Socket,
      (s) => {
        const pl = (s.players ?? []).find((p: any) => p.id === 'p1')
        const rowCards = pl?.board?.[row] ?? []
        return rowCards.some((c: any) => c.id === card.id)
      },
      15000,
    )

    const expected = publicBoardSnapshot(afterPlay)

    p1Socket.disconnect()
    await new Promise<void>((r) => setTimeout(r, 150))

    newP1 = connectSocket()
    await waitForConnect(newP1)

    const playerPromise = new Promise<string>((resolve) => {
      newP1!.once('you_are_player', (payload: any) => resolve(String(payload.playerId)))
    })

    const synced = waitForState(
      newP1,
      (s) => {
        const pl = (s.players ?? []).find((p: any) => p.id === 'p1')
        const rowCards = pl?.board?.[row] ?? []
        return rowCards.some((c: any) => c.id === card.id)
      },
      15000,
    )

    newP1.emit('join_game', { gameId })

    const playerId = await playerPromise
    expect(playerId).toBe('p1')

    const reconnected = await synced
    expect(publicBoardSnapshot(reconnected)).toEqual(expected)
  } finally {
    newP1?.disconnect()
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
