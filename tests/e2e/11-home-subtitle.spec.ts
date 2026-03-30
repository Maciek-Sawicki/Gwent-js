import { test, expect } from '@playwright/test'

test('strona główna pokazuje podtytuł', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('home-subtitle')).toHaveText('Wiedźmińska gra karciana')
})
