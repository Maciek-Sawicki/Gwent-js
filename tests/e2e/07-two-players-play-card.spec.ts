import { test, expect } from '@playwright/test'
import { openTwoPlayerSession } from './helpers'

test.describe.configure({ mode: 'serial' })

test('po dołączeniu obu graczy aktywny gracz może wybrać kartę i położyć na dozwolonym rzędzie', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000)
  const url = baseURL ?? 'http://localhost:5173'

  const session = await openTwoPlayerSession(browser, url)

  try {
    const { host, guest } = session

    const hostMyTurn = await host.getByTestId('turn-your-turn').isVisible()
    const active = hostMyTurn ? host : guest

    await expect(active.getByTestId('turn-your-turn')).toBeVisible({ timeout: 10_000 })

    await active.getByTestId('player-hand').locator('.hand-card').nth(1).click();

    const placeableRows = active.locator('.row-zone.is-placeable');

    await expect(placeableRows.first()).toBeVisible({ timeout: 10000 });

    await placeableRows.first().click();
  } finally {
    await session.close()
  }
})
