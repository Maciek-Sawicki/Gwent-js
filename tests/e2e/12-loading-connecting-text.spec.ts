import { test, expect } from '@playwright/test'

test('po utworzeniu gry widać tekst łączenia z serwerem', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('home-create-game').click()
  await expect(page.getByTestId('game-connecting-text')).toBeVisible()
  await expect(page.getByTestId('game-connecting-text')).toHaveText('Łączenie z grą...')
})
