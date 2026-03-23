import { test, expect } from '@playwright/test'
import { hostCreatesGame, guestJoinsGame } from './helpers'

test.describe.configure({ mode: 'serial' })

test('host po utworzeniu widzi komunikat oczekiwania w lobby (status WAITING)', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(60_000)
  const url = baseURL ?? 'http://localhost:5173'

  const hostContext = await browser.newContext()
  const guestContext = await browser.newContext()

  try {
    const host = await hostContext.newPage()
    await hostCreatesGame(host, url)

    await expect(host.getByTestId('waiting-for-player-text')).toHaveText(
      /Czekasz na drugiego gracza|Oczekiwanie na rozpoczęcie gry/,
    )

    const code =
      (await host.getByTestId('loading-game-code-value').textContent())?.trim() ?? ''
    const guest = await guestContext.newPage()
    await guestJoinsGame(guest, url, code)
  } finally {
    await guestContext.close()
    await hostContext.close()
  }
})
