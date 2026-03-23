import { test, expect } from '@playwright/test'
import { hostCreatesGame, guestJoinsGame, waitForBothInMatch } from './helpers'

test.describe.configure({ mode: 'serial' })

test('host tworzy grę, gość dołącza kodem – oboje widzą aktywną grę', async ({ browser, baseURL }) => {
  test.setTimeout(120_000)
  const url = baseURL ?? 'http://localhost:5173'

  const hostContext = await browser.newContext()
  const guestContext = await browser.newContext()

  try {
    const host = await hostContext.newPage()
    const guest = await guestContext.newPage()

    const code = await hostCreatesGame(host, url)
    await guestJoinsGame(guest, url, code)

    await waitForBothInMatch(host, guest)

    await expect(host.getByTestId('game-header')).toBeVisible()
    await expect(guest.getByTestId('game-header')).toBeVisible()
    await expect(host.getByTestId('player-hand')).toBeVisible()
    await expect(guest.getByTestId('player-hand')).toBeVisible()
  } finally {
    await guestContext.close()
    await hostContext.close()
  }
})
