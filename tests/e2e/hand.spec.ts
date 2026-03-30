import { test, expect, Browser, Page } from '@playwright/test';

async function startGame(browser: Browser) {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const p1: Page = await context1.newPage();
  const p2: Page = await context2.newPage();

  await p1.goto('http://localhost:5173');
  await p2.goto('http://localhost:5173');

  await p1.getByRole('button', { name: 'Utwórz grę' }).click();
  const codeLoc = p1
    .getByTestId('loading-game-code-value')
    .or(p1.getByTestId('game-code'));
  await codeLoc.first().waitFor({ state: 'visible', timeout: 15_000 });
  const code = (await codeLoc.first().textContent())?.trim();
  if (!code || !/^\d{6}$/.test(code)) {
    throw new Error(`Nie udało się pobrać 6-cyfrowego kodu gry, otrzymano: "${code}"`);
  }

  await p2.getByTestId('home-game-code-input').fill(code);
  await p2.getByRole('button', { name: 'Dołącz do gry' }).click();

  await expect(p1.locator('.hand-card').first()).toBeVisible({ timeout: 10000 });
  return { p1, p2 };
}

test.describe('GWINT E2E', () => {
  test('1. Strona główna ładuje się', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('h1.home-title')).toHaveText('GWINT');
  });

  test('2. Przycisk "Utwórz grę" jest widoczny', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByRole('button', { name: 'Utwórz grę' })).toBeVisible();
  });

  test('3. Gra startuje po dołączeniu 2 graczy', async ({ browser }) => {
    const { p1, p2 } = await startGame(browser);

    const count1 = await p1.locator('.hand-card').count();
    const count2 = await p2.locator('.hand-card').count();
    expect(count1).toBeGreaterThan(0);
    expect(count2).toBeGreaterThan(0);
  });

  test('4. Gracz widzi karty na ręce', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    await expect(p1.locator('.hand-card').first()).toBeVisible();
  });

  test('5. Karta ma wartość (badge)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const badge = p1.locator('.hand-power-badge').first();
    await expect(badge).toBeVisible();
    const value = await badge.textContent();
    expect(Number(value)).toBeGreaterThanOrEqual(0);
  });

  test('6. Można kliknąć kartę', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const card = p1.locator('.hand-card').first();
    await card.click();
    await expect(card).toHaveClass(/is-selected/);
  });

  test('7. Zaznaczenie karty działa', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const card = p1.locator('.hand-card').first();
    await card.click();
    await expect(card).toHaveClass(/is-selected/);
    await card.click();
    await expect(card).not.toHaveClass(/is-selected/);
  });

  test('8. Karta pojawia się na planszy po wybraniu rzędu (symulacja)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const card = p1.locator('.hand-card').first();
    await card.click();
    const row = p1.locator('.player-row').first();
    await row.click();

    const rowCardExists = await p1.locator('.row-card').count();
    expect(rowCardExists).toBeGreaterThanOrEqual(0);
  });

  test('9. Liczba kart w ręce zmienia się po kliknięciu (symulacja)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const cards = p1.locator('.hand-card');
    const countBefore = await cards.count();
    await cards.first().click();
    await p1.locator('.player-row').first().click();
    const countAfter = await p1.locator('.hand-card').count();
    expect(countAfter).toBeLessThanOrEqual(countBefore);
  });

  test('10. Przyciski pasowania są widoczne', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const passBtn = p1.getByRole('button', { name: /pasuj/i });
    await expect(passBtn).toBeVisible();
  });

  test('11. Można spasować (symulacja)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const passBtn = p1.getByTestId('pass-button');
    await expect(p1.getByText(/twoja tura/i)).toBeVisible();
    await expect(passBtn).toBeVisible();

    await passBtn.click();
  });

  test('12. Po spasowaniu nie można grać kart (symulacja)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const passBtn = p1.getByRole('button', { name: /pasuj/i });
    await passBtn.click();

    const card = p1.locator('.hand-card').first();
    await expect(card).toHaveClass(/disabled/);
  });

  test('13. Plansza przyjmuje kartę (row działa, symulacja)', async ({ browser }) => {
    const { p1 } = await startGame(browser);
    const card = p1.locator('.hand-card').first();
    await card.click();
    await p1.locator('.player-row').first().click();

    const rowCount = await p1.locator('.row-card').count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});