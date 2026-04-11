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
      // Keep the stable CI signal limited to the deterministic playground coverage.
      testIgnore: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'firefox-playground',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: playgroundBaseURL,
        ignoreHTTPSErrors: true,
      },
      // Playground remains the cross-browser practice area.
      testIgnore: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'chromium-orangehrm-live',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: orangeHrmBaseURL,
        ignoreHTTPSErrors: true,
      },
      // OrangeHRM is the primary showcase, but it stays out of the blocking CI gate because
      // the external demo environment is not a trustworthy availability signal.
      testMatch: ['tests/ui/orangehrm/**/*.spec.ts'],
    },
    {
      name: 'chromium-orangehrm-debug',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: orangeHrmBaseURL,
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      // Opt-in debugging project for first-failure evidence on the live OrangeHRM demo.
      outputDir: 'test-results/orangehrm-debug',
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
