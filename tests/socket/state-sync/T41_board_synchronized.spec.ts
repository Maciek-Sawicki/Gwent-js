import { test, expect } from '@playwright/test'

import {
  nextStateUpdate,
  publicBoardSnapshot,
  setupTwoPlayerGame,
} from '../moves-validation/helpers'

test('T41 - Board state stays synchronized', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game

  expect(state.currentPlayer).toBe('p1')

  const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')
  const card = p1?.hand?.[0]
  expect(card?.id).toBeTruthy()
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  try {
    const u1 = nextStateUpdate(p1Socket)
    const u2 = nextStateUpdate(p2Socket)

    p1Socket.emit('play_card', { cardId: card.id, row })

    const [s1, s2] = await Promise.all([u1, u2])

    expect(publicBoardSnapshot(s1)).toEqual(publicBoardSnapshot(s2))
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})
