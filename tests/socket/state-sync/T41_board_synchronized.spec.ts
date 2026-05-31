import { test, expect } from '@playwright/test'

import {
  publicBoardSnapshot,
  setupTwoPlayerGame,
  waitForState,
} from '../moves-validation/helpers'

test('T41 - Board state stays synchronized', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  const cardOnBoard = (s: any) =>
    (s.players ?? []).some((pl: any) =>
      (pl?.board?.[row] ?? []).some((c: any) => c.id === card.id),
    )

  try {
    const p1Synced = waitForState(p1Socket, cardOnBoard, 15000)
    const p2Synced = waitForState(p2Socket, cardOnBoard, 15000)

    p1Socket.emit('play_card', { cardId: card.id, row })

    const [s1, s2] = await Promise.all([p1Synced, p2Synced])

    expect(publicBoardSnapshot(s1)).toEqual(publicBoardSnapshot(s2))
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
