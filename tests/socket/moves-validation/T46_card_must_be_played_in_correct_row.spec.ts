import { test, expect } from '@playwright/test'

import { setupTwoPlayerGame, waitForError } from './helpers'

const ALL_ROWS = ['MELEE', 'RANGED', 'SIEGE'] as const

test('T46 - Card must be played in correct row', async () => {
  const game = await setupTwoPlayerGame()

  const { p1Socket, p2Socket, state } = game
  const activePlayerId = state.currentPlayer as 'p1' | 'p2'
  const activeSocket = activePlayerId === 'p1' ? p1Socket : p2Socket

  const activePlayer = (state.players ?? []).find((p: any) => p.id === activePlayerId)
  const card = (activePlayer?.hand ?? []).find(
    (c: any) =>
      Array.isArray(c.allowedRows) &&
      c.allowedRows.length > 0 &&
      ALL_ROWS.some((r) => !c.allowedRows.includes(r)),
  )
  expect(card, 'opening hand should contain a row-restricted unit').toBeTruthy()

  const wrongRow = ALL_ROWS.find((r) => !card!.allowedRows.includes(r))!

  let err = ''
  try {
    const errorPromise = waitForError(activeSocket)
    activeSocket.emit('play_card', { cardId: card!.id, row: wrongRow })
    err = await errorPromise
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }

  expect(err).toContain('Card cannot be played on this row')
})
