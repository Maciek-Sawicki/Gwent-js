import { test, expect } from '@playwright/test'

import {
  setupTwoPlayerGame,
  waitForError,
} from './helpers'

test('T14 - Player cannot play card not in hand', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game
  const activePlayerId = state.currentPlayer as 'p1' | 'p2'
  const activeSocket = activePlayerId === 'p1' ? p1Socket : p2Socket

  const invalidCardId = `invalid-card-${Math.random().toString(16).slice(2)}`

  let err = ''
  try {
    const errorPromise = waitForError(activeSocket)
    activeSocket.emit('play_card', { cardId: invalidCardId, row: 'MELEE' })
    err = await errorPromise
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }

  expect(err).toContain('Card not in hand')
})

