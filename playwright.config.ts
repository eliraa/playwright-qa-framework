import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const localBaseURL = process.env.LOCAL_BASE_URL ?? 'http://localhost:4200';
const playgroundBaseURL =
  process.env.BASE_URL ??
  process.env.PLAYGROUND_BASE_URL ??
  'https://uitestingplayground.com';

export default defineConfig({
  testDir: './tests',
  timeout: 40_000,
  globalTimeout: 10 * 60 * 1000,

  expect: {
    timeout: 2_000,
  },

  fullyParallel: true,
  retries: 1,
  reporter: [['html'], ['list']],

  use: {
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
    trace: 'on-first-retry',
    actionTimeout: 20_000,
    navigationTimeout: 25_000,
    video: 'off',
  },

  projects: [
    {
      name: 'chromium-playground',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: playgroundBaseURL,
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'firefox-playground',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: playgroundBaseURL,
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'chromium-local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: localBaseURL,
      },
      testIgnore: ['tests/autoWaiting.spec.ts', 'tests/dynamicElements.spec.ts', 'tests/visibility.spec.ts', 'tests/ajax.spec.ts', 'tests/geolocation.spec.ts'],
    },
  ],
});
