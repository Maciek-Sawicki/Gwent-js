import { test, expect } from '@playwright/test'

import {
  playerScoresTuple,
  setupTwoPlayerGame,
  totalBoardCardCount,
  waitForState,
} from '../moves-validation/helpers'

test('T42 - Points update for both players', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  const scoresBefore = playerScoresTuple(state)
  const cardsOnBoardBefore = totalBoardCardCount(state)

  try {
    const seenOnP1 = waitForState(
      p1Socket,
      (s) => totalBoardCardCount(s) > cardsOnBoardBefore,
      15000,
    )
    const seenOnP2 = waitForState(
      p2Socket,
      (s) => totalBoardCardCount(s) > cardsOnBoardBefore,
      15000,
    )

    p1Socket.emit('play_card', { cardId: card.id, row })

    const [fromP1, fromP2] = await Promise.all([seenOnP1, seenOnP2])

    expect(playerScoresTuple(fromP1)).toEqual(playerScoresTuple(fromP2))

    const sum = (t: number[]) => t.reduce((a, b) => a + b, 0)
    expect(sum(playerScoresTuple(fromP1))).not.toBe(sum(scoresBefore))
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
