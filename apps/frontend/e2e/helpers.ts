import type { Browser, BrowserContext, Page } from '@playwright/test'

export const SOCKET_GAME_TIMEOUT_MS = 90_000

export async function hostCreatesGame(host: Page, baseURL: string): Promise<string> {
  await host.goto(baseURL)
  await host.getByTestId('home-create-game').click()
  await host.getByTestId('loading-game-code-value').waitFor({
    state: 'visible',
    timeout: 15_000,
  })
  const code = (await host.getByTestId('loading-game-code-value').textContent())?.trim() ?? ''
  if (!/^\d{6}$/.test(code)) {
    throw new Error(`Oczekiwano 6-cyfrowego kodu, otrzymano: "${code}"`)
  }

  await host.getByTestId('waiting-for-player-text').waitFor({
    state: 'visible',
    timeout: 25_000,
  })

  return code
}

export async function guestJoinsGame(guest: Page, baseURL: string, code: string): Promise<void> {
  await guest.goto(baseURL)
  await guest.getByTestId('home-game-code-input').fill(code)
  await guest.getByTestId('home-join-game').click()
}

export async function waitForBothInMatch(host: Page, guest: Page): Promise<void> {
  await Promise.all([
    host.getByTestId('game-active-screen').waitFor({
      state: 'visible',
      timeout: SOCKET_GAME_TIMEOUT_MS,
    }),
    guest.getByTestId('game-active-screen').waitFor({
      state: 'visible',
      timeout: SOCKET_GAME_TIMEOUT_MS,
    }),
  ])
}

export type TwoPlayerSession = {
  host: Page
  guest: Page
  code: string
  hostContext: BrowserContext
  guestContext: BrowserContext
  close: () => Promise<void>
}

export async function openTwoPlayerSession(
  browser: Browser,
  baseURL: string,
): Promise<TwoPlayerSession> {
  const hostContext = await browser.newContext()
  const guestContext = await browser.newContext()
  const host = await hostContext.newPage()
  const guest = await guestContext.newPage()
  const code = await hostCreatesGame(host, baseURL)
  await guestJoinsGame(guest, baseURL, code)
  await waitForBothInMatch(host, guest)

  async function close() {
    await guestContext.close()
    await hostContext.close()
  }

  return { host, guest, code, hostContext, guestContext, close }
}
