import { test, expect } from '@playwright/test'
import { setupTwoPlayerGame } from '../moves-validation/helpers'

test('T35 - Player 1 receives starting hand', async () => {
  const { p1Socket, p2Socket, state } = await setupTwoPlayerGame()

  try {
    const p1 = (state.players ?? []).find((p: any) => p.id === 'p1')

    expect(p1).toBeTruthy()
    expect(p1.hand).toBeTruthy()
    expect(p1.hand.length).toBeGreaterThan(0)
  } finally {
    p1Socket.disconnect()
    p2Socket.disconnect()
  }
})