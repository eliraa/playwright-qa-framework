import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { getLocalBaseUrl, getRemoteBaseUrl } from './src/config/testEnvironment';

dotenv.config();

const isCI = !!process.env.CI;
const localBaseURL = getLocalBaseUrl();
const playgroundBaseURL = getRemoteBaseUrl('playground');
const orangeHrmBaseURL = getRemoteBaseUrl('orangehrm');

export default defineConfig({
  testDir: './tests',
  timeout: 40_000,
  globalTimeout: 10 * 60 * 1000,
  forbidOnly: isCI,

  expect: {
    timeout: 5_000,
  },

  fullyParallel: true,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['html'], ['list']]
    : [['html'], ['list']],

  use: {
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
    trace: isCI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: isCI ? 'only-on-failure' : 'off',
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
      // Keep the main Chromium signal limited to the stable playground coverage.
      testIgnore: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'firefox-playground',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: playgroundBaseURL,
        ignoreHTTPSErrors: true,
      },
      // OrangeHRM is intentionally stabilized in Chromium first.
      testIgnore: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'chromium-orangehrm-live',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: orangeHrmBaseURL,
        ignoreHTTPSErrors: true,
      },
      // This project keeps the live OrangeHRM demo coverage available without making it
      // part of the main blocking suite.
      testMatch: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'chromium-local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: localBaseURL,
      },
      testIgnore: [
        'tests/ui/playground/**/*.spec.ts',
        'tests/ui/orangehrm/**/*.spec.ts',
      ],
    },
  ],
});
