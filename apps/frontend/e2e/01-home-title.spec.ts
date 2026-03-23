import { test, expect } from '@playwright/test'

test('strona główna pokazuje tytuł GWINT', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('home-title')).toHaveText('GWINT')
})
