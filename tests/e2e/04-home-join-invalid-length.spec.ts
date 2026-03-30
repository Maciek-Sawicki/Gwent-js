import { test, expect } from '@playwright/test'

test('Dołącz z kodem krótszym niż 6 cyfr pokazuje błąd walidacji', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('home-game-code-input').fill('123')
  await page.getByTestId('home-join-game').click()
  await expect(page.getByTestId('home-join-error')).toHaveText('Kod musi składać się z 6 cyfr')
})
