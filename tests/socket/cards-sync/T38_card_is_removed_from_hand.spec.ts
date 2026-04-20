import { test, expect } from '@playwright/test'
import { setupTwoPlayerGame, waitForState } from '../moves-validation/helpers'

test('T38 - Card played is removed from hand', async () => {
  const game = await setupTwoPlayerGame()
  const { p1Socket, p2Socket, state } = game

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]

  expect(card?.id).toBeTruthy()

  const row = card?.allowedRows?.[0] ?? 'MELEE'

  try {
    const updatedState = waitForState(
      p1Socket,
      (s) => {
        const player = (s.players ?? []).find((p: any) => p.id === 'p1')
        return !(player?.hand ?? []).some((c: any) => c.id === card.id)
      },
      15000,
    )

    p1Socket.emit('play_card', { cardId: card.id, row })

    await updatedState
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})