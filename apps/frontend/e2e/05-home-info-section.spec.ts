import { test, expect } from '@playwright/test'

test('sekcja informacji na stronie głównej jest widoczna', async ({ page }) => {
  await page.goto('/')
  const info = page.getByTestId('home-info')
  await expect(info).toBeVisible()
  await expect(info).toContainText('Utwórz grę')
  await expect(info).toContainText('drugiemu graczowi')
})
