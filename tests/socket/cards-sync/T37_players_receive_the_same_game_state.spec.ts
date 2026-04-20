import { test, expect } from '@playwright/test'

import {
  setupTwoPlayerGame,
  waitForState,
  publicBoardSnapshot,
  totalBoardCardCount,
} from '../moves-validation/helpers'

test('T37 - Players receive the same game state', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()

  const row = card?.allowedRows?.[0] ?? 'MELEE'
  const cardsBefore = totalBoardCardCount(state)

  try {
    const seenOnP1 = waitForState(
      p1Socket,
      (s) => totalBoardCardCount(s) > cardsBefore,
      15000,
    )

    const seenOnP2 = waitForState(
      p2Socket,
      (s) => totalBoardCardCount(s) > cardsBefore,
      15000,
    )

    p1Socket.emit('play_card', { cardId: card.id, row })
    const [s1, s2] = await Promise.all([seenOnP1, seenOnP2])

    expect(publicBoardSnapshot(s1)).toEqual(publicBoardSnapshot(s2))
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})