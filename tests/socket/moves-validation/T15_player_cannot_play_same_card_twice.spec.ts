import { test, expect } from '@playwright/test'

import {
  setupTwoPlayerGame,
  waitForError,
  waitForState,
} from './helpers'

test('T15 - Player cannot play same card twice', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game
  const activePlayerId = state.currentPlayer as 'p1' | 'p2'
  const opponentPlayerId = activePlayerId === 'p1' ? 'p2' : 'p1'

  const activeSocket = activePlayerId === 'p1' ? p1Socket : p2Socket
  const opponentSocket = opponentPlayerId === 'p1' ? p1Socket : p2Socket
  const activePlayer = (state.players ?? []).find((p: any) => p.id === activePlayerId)
  const card = activePlayer?.hand?.[0]
  const row = card?.allowedRows?.[0] ?? 'MELEE'

  let err = ''

  try {
    const cardId = card.id as string

    activeSocket.emit('play_card', { cardId, row })

    await waitForState(p1Socket, (s) => s?.currentPlayer === opponentPlayerId, 15000)

    opponentSocket.emit('pass')
    await waitForState(p1Socket, (s) => s?.currentPlayer === activePlayerId, 15000)

    const errorPromise = waitForError(activeSocket)
    activeSocket.emit('play_card', { cardId, row })
    err = await errorPromise
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }

  expect(err).toContain('Card not in hand')
})

