import { test, expect } from '@playwright/test'
import { openTwoPlayerSession } from './helpers'

test.describe.configure({ mode: 'serial' })

test('gracz bez tury ma nieaktywny przycisk PASUJ', async ({ browser, baseURL }) => {
  test.setTimeout(120_000)
  const url = baseURL ?? 'http://localhost:5173'

  const session = await openTwoPlayerSession(browser, url)

  try {
    const { host, guest } = session

    const hostWaiting = await host.getByTestId('turn-opponent').isVisible()
    const waiting = hostWaiting ? host : guest

    await expect(waiting.getByTestId('turn-opponent')).toBeVisible({ timeout: 10_000 })
    await expect(waiting.getByTestId('pass-button')).toBeDisabled()
  } finally {
    await session.close()
  }
})
