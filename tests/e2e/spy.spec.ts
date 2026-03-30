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

  await expect(p1.getByTestId("game-active-screen")).toBeVisible();
  await expect(p2.getByTestId("game-active-screen")).toBeVisible();

  await expect(p1.locator('.hand-card').first()).toBeVisible({ timeout: 10000 });
  return { p1, p2 };
}

test('1. spy daje +2 karty (10 -> 11)', async ({ browser }) => {
  const { p1 } = await startGame(browser);

  const hand = p1.locator('.hand-card');

  const before = await hand.count();
  expect(before).toBe(10);
  const spyCard = hand.first();
  await spyCard.click();
  await expect(spyCard).toHaveClass(/is-selected/);
  await p1.locator('.opponent-row.row-3').click();

  await expect(hand).toHaveCount(11, { timeout: 10000 });
});

test('2. spy trafia na planszę przeciwnika', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  const spyCard = p1.locator('.hand-card').first();
  await spyCard.click();
  await p1.locator('.opponent-row.row-3').click();
  await expect(p1.locator('.opponent-row .row-card')).toHaveCount(1);
});

test('3. spy nie może być zagrany na własny rząd', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  const spyCard = p1.locator('.hand-card').first();
  await spyCard.click();
  await p1.locator('.player-row').first().click();
  await expect(p1.locator('.player-row .row-card')).toHaveCount(0);
});

test('4. spy znika z ręki po zagraniu', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  const hand = p1.locator('.hand-card');
  const before = await hand.count();
  const spy = hand.first();
  await spy.click();
  await p1.locator('.opponent-row.row-3').click();
  await expect(hand).toHaveCount(before + 1); 
});

test('5. spy nie działa poza swoją turą', async ({ browser }) => {
  const { p1, p2 } = await startGame(browser);
  const card = p2.locator('.hand-card').first();
  await expect(card).toHaveClass(/disabled/);
  await expect(card).not.toHaveClass(/is-selected/);
});

test('6. spy dobiera dokładnie 2 karty', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  const hand = p1.locator('.hand-card');
  const before = await hand.count();
  await hand.first().click();
  await p1.locator('.opponent-row.row-3').click();
  await expect.poll(async () => await hand.count()).toBe(before + 1);
});

test('7. kliknięcie rzędu bez wybranej karty nic nie robi', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  await p1.locator('.opponent-row.row-3').click();
  await expect(p1.locator('.row-card')).toHaveCount(0);
});

test('8. spy działa tylko na dozwolonym rzędzie', async ({ browser }) => {
  const { p1 } = await startGame(browser);
  const card = p1.locator('.hand-card').first();
  await card.click();
  await p1.locator('.opponent-row.row-1').click();
  await expect(p1.locator('.row-card')).toHaveCount(0);
});