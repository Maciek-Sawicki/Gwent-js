import { test, expect } from '@playwright/test'

import { setupTwoPlayerGame, waitForState } from '../moves-validation/helpers'

test('T39 - Player 1 plays card → Player 2 receives update', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  try {
    const p2SeesCard = waitForState(
      p2Socket,
      (s) => {
        const pl = (s.players ?? []).find((p: any) => p.id === 'p1')
        const rowCards = pl?.board?.[row] ?? []
        return rowCards.some((c: any) => c.id === card.id)
      },
      15000,
    )

    p1Socket.emit('play_card', { cardId: card.id, row })
    await p2SeesCard
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
