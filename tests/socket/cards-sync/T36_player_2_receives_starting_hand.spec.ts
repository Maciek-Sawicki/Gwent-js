import { test, expect } from '@playwright/test'
import { setupTwoPlayerGame } from '../moves-validation/helpers'

test('T36 - Player 2 receives starting hand', async () => {
  const { p1Socket, p2Socket, state } = await setupTwoPlayerGame()

  try {
    const p2 = (state.players ?? []).find((p: any) => p.id === 'p2')

    expect(p2).toBeTruthy()
    expect(p2.hand).toBeTruthy()
    expect(p2.hand.length).toBeGreaterThan(0)
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})