import { test, expect } from '@playwright/test';

test('dla nieistniejącego kodu gra jest tworzona i jest oczekiwanie na dołączenie 2 gracza', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('input', '999999');
  await page.getByRole('button', { name: 'Dołącz do gry' }).click();
  await expect(page.locator('.hand-card')).toHaveCount(0);
  await expect(page.locator('text=Łączenie z grą')).toBeVisible();
});
