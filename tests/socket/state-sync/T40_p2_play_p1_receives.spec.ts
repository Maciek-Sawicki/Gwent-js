import { test, expect } from '@playwright/test'

import { setupTwoPlayerGame, waitForState } from '../moves-validation/helpers'

test('T40 - Player 2 plays card → Player 1 receives update', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  try {
    p1Socket.emit('pass')
    const readyForP2 = await waitForState(
      p1Socket,
      (s) => s?.currentPlayer === 'p2',
      15000,
    )

    const p2 = (readyForP2.players ?? []).find((p: any) => p.id === 'p2')
    const card = p2?.hand?.[0]
    expect(card?.id).toBeTruthy()
    const row = card?.allowedRows?.[0] ?? 'MELEE'

    const p1SeesCard = waitForState(
      p1Socket,
      (s) => {
        const pl = (s.players ?? []).find((p: any) => p.id === 'p2')
        const rowCards = pl?.board?.[row] ?? []
        return rowCards.some((c: any) => c.id === card.id)
      },
      15000,
    )

    p2Socket.emit('play_card', { cardId: card.id, row })
    await p1SeesCard
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
