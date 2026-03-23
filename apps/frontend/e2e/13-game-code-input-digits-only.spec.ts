import { test, expect } from '@playwright/test'

test('pole kodu: tylko cyfry, max 6', async ({ page }) => {
  await page.goto('/')
  const input = page.getByTestId('home-game-code-input')

  await input.fill('123456789')
  await expect(input).toHaveValue('123456')

  await input.clear()
  await input.click()
  await page.keyboard.type('1a2b3c4d5e6')
  await expect(input).toHaveValue('123456')
})
