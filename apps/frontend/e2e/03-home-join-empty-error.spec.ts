import { test, expect } from '@playwright/test'

test('Dołącz bez kodu pokazuje komunikat błędu', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('home-join-game').click()
  await expect(page.getByTestId('home-join-error')).toHaveText('Wprowadź kod gry')
})
