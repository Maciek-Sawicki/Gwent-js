import { test, expect } from '@playwright/test'

test('Opuść grę wraca na stronę główną', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('home-create-game').click()
  await expect(page.getByTestId('game-loading-screen')).toBeVisible()
  await page.getByTestId('game-leave-button').click()
  await expect(page.getByTestId('home-title')).toBeVisible()
  await expect(page.getByTestId('home-create-game')).toBeVisible()
})
