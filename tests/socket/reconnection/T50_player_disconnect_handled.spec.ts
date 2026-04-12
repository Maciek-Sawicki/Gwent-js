import { test, expect } from '@playwright/test'

import { setupTwoPlayerGame, waitForState } from '../moves-validation/helpers'

test('T50 - Player disconnect is handled', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  try {
    p1Socket.emit('play_card', { cardId: card!.id, row })
    await waitForState(p2Socket, (s) => s?.currentPlayer === 'p2', 15000)

    p1Socket.disconnect()
    await new Promise<void>((r) => setTimeout(r, 150))

    const disconnectedSeen = waitForState(
      p2Socket,
      (s) => {
        const p1p = (s.players ?? []).find((p: any) => p.id === 'p1')
        const p2p = (s.players ?? []).find((p: any) => p.id === 'p2')
        return !p1p?.socketId && !!p2p?.socketId
      },
      15000,
    )

    p2Socket.emit('pass')
    await disconnectedSeen
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
