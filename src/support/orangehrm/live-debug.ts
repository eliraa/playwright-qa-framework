import { Buffer } from 'node:buffer';
import type { Page, TestInfo } from '@playwright/test';

type OrangeHrmDebugSession = {
  entries: string[];
};

const debugSessions = new WeakMap<Page, OrangeHrmDebugSession>();

export function isOrangeHrmDebugEnabled(): boolean {
  return process.env.ORANGEHRM_DEBUG === '1';
}

export function registerOrangeHrmDebugSession(page: Page): void {
  if (!isOrangeHrmDebugEnabled()) {
    return;
  }

  debugSessions.set(page, { entries: [] });
}

export function logOrangeHrmDebug(
  page: Page,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!isOrangeHrmDebugEnabled()) {
    return;
  }

  const session = debugSessions.get(page);

  if (!session) {
    return;
  }

  const detailText = details ? ` | ${JSON.stringify(normalizeDebugValue(details))}` : '';
  const entry = `[${new Date().toISOString()}] ${message}${detailText}`;

  session.entries.push(entry);
  console.info(`[orangehrm-debug] ${entry}`);
}

export async function attachOrangeHrmDebugLog(page: Page, testInfo: TestInfo): Promise<void> {
  if (!isOrangeHrmDebugEnabled()) {
    return;
  }

  const session = debugSessions.get(page);

  if (!session) {
    return;
  }

  try {
    if (
      session.entries.length > 0
      && testInfo.status !== testInfo.expectedStatus
    ) {
      await testInfo.attach('orangehrm-debug-log', {
        body: Buffer.from(session.entries.join('\n'), 'utf8'),
        contentType: 'text/plain',
      });
    }
  } finally {
    debugSessions.delete(page);
  }
}

export function describeOrangeHrmDebugError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

function normalizeDebugValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDebugValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeDebugValue(nestedValue)]),
    );
  }

  return value;
}
