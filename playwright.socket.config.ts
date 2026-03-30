import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const serverDir = path.resolve(__dirname, 'apps/server')

export default defineConfig({
  testDir: './tests/socket',

  // Socket testy mogą startować równolegle, ale żeby uniknąć
  // flaków i problemów z zasobami, ustawiamy sekwencyjnie.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: serverDir,
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: process.env.PORT ?? '4000',
      },
    },
  ],
})

