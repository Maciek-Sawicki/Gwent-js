import { test, expect } from '@playwright/test'

import {
  setupTwoPlayerGame,
  waitForError,
} from './helpers'

test('T13 - Player cannot play card outside their turn', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game
  const activePlayerId = state.currentPlayer as 'p1' | 'p2'
  const otherPlayerId = activePlayerId === 'p1' ? 'p2' : 'p1'

  const otherSocket = otherPlayerId === 'p1' ? p1Socket : p2Socket
  const otherPlayer = (state.players ?? []).find((p: any) => p.id === otherPlayerId)
  const card = otherPlayer?.hand?.[0]
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  let err = ''
  try {
    const errorPromise = waitForError(otherSocket)
    otherSocket.emit('play_card', { cardId: card.id, row })
    err = await errorPromise
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }

  expect(err).toBe('Not your turn')
})

