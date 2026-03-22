export type TestEnvironment = 'playground' | 'orangehrm';

const supportedTestEnvironments: readonly TestEnvironment[] = ['playground', 'orangehrm'];

function isTestEnvironment(value: string | undefined): value is TestEnvironment {
  return value !== undefined && supportedTestEnvironments.includes(value as TestEnvironment);
}

export function getSelectedTestEnvironment(): TestEnvironment {
  const requestedEnvironment = process.env.TEST_ENV;

  return isTestEnvironment(requestedEnvironment) ? requestedEnvironment : 'playground';
}

function getPlaygroundBaseUrl(): string {
  return (
    process.env.PLAYGROUND_BASE_URL ??
    process.env.BASE_URL ??
    'https://uitestingplayground.com'
  );
}

function getOrangeHrmBaseUrl(): string {
  return process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com/';
}

export function getRemoteBaseUrl(
  environment: TestEnvironment = getSelectedTestEnvironment(),
): string {
  return environment === 'orangehrm' ? getOrangeHrmBaseUrl() : getPlaygroundBaseUrl();
}

export function getLocalBaseUrl(): string {
  return process.env.LOCAL_BASE_URL ?? 'http://localhost:4200';
}

export function buildAppUrl(
  pathname: string,
  environment: TestEnvironment = getSelectedTestEnvironment(),
): string {
  return new URL(pathname, getRemoteBaseUrl(environment)).toString();
}
