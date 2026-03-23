import { test, expect } from '@playwright/test'

test('Utwórz grę przechodzi do ekranu łączenia z widocznym kodem', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('home-create-game').click()
  await expect(page.getByTestId('game-loading-screen')).toBeVisible()
  await expect(page.getByTestId('loading-game-code-value')).toHaveText(/^\d{6}$/)
})
