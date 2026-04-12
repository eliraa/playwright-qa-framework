import { Buffer } from 'node:buffer';
import type { Page, TestInfo } from '@playwright/test';

type OrangeHrmDebugSession = {
  entries: string[];
};

// Keep debug buffers scoped to the Playwright Page so they disappear with the page
// and cannot leak log entries across tests.
const debugSessions = new WeakMap<Page, OrangeHrmDebugSession>();

export function isOrangeHrmDebugEnabled(): boolean {
  return process.env.ORANGEHRM_DEBUG === '1';
}

export function registerOrangeHrmDebugSession(page: Page): void {
  if (!isOrangeHrmDebugEnabled()) {
    return;
  }

  // The page objects call into this logger unconditionally, so initialize the
  // per-page buffer once in the fixture and let regular runs stay a cheap no-op.
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
    // Missing session means the debug fixture was not enabled for this page, so
    // logging should quietly opt out instead of making normal runs fail.
    return;
  }

  // Flatten nested data and native Error instances into stable JSON so the console
  // output and attached artifact stay readable.
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
      // Successful runs already have enough signal from the standard reporter.
      // Attach the custom log only when the test outcome is unexpectedly bad.
      await testInfo.attach('orangehrm-debug-log', {
        body: Buffer.from(session.entries.join('\n'), 'utf8'),
        contentType: 'text/plain',
      });
    }
  } finally {
    // Always clear the page-scoped buffer after the fixture finishes, even if the
    // attach step throws, so later tests start from a clean debug state.
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
    // Native Error objects do not serialize usefully with JSON.stringify, so reduce
    // them to the fields that matter in a failure artifact.
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
