import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const port = Number(process.env.ARC_WEB_PORT) || 3008
const baseURL = `http://localhost:${port}`

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Host workaround for hosts missing libnspr4/libnss3/libasound2, see
// scripts/ensure-chromium-libs.sh. Safe to remove once the host has them installed.
const chromiumLibDir = path.join(dirname, '.cache/chromium-libs/root/usr/lib/x86_64-linux-gnu')
const launchEnv = existsSync(chromiumLibDir)
  ? { ...process.env, LD_LIBRARY_PATH: [chromiumLibDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') }
  : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: launchEnv ? { env: launchEnv } : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm run build && pnpm run preview --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
