import { test as base, type Request } from '@playwright/test';
import { isOrangeHrmAdminUsersUrl } from '../../support/orangehrm/admin-users.api';
import {
  attachOrangeHrmDebugLog,
  isOrangeHrmDebugEnabled,
  logOrangeHrmDebug,
  registerOrangeHrmDebugSession,
} from '../../support/orangehrm/live-debug';

type OrangeHrmLiveFixtures = {
  orangeHrmDebugSession: void;
};

export const test = base.extend<OrangeHrmLiveFixtures>({
  orangeHrmDebugSession: [async ({ page }, use, testInfo) => {
    if (!isOrangeHrmDebugEnabled()) {
      await use();
      return;
    }

    // Centralize debug wiring in one auto fixture so specs and page objects can emit
    // context freely without each test repeating listener setup and teardown.
    registerOrangeHrmDebugSession(page);
    logOrangeHrmDebug(page, 'OrangeHRM debug capture enabled', {
      testTitle: testInfo.title,
      project: testInfo.project.name,
    });

    const onRequestFailed = (request: Request): void => {
      // Ignore unrelated browser noise and keep the artifact focused on the live
      // OrangeHRM app plus the admin-users API that drives the showcase workflow.
      if (!isRelevantOrangeHrmRequest(request.url())) {
        return;
      }

      logOrangeHrmDebug(page, 'OrangeHRM request failed', {
        method: request.method(),
        url: request.url(),
        failureText: request.failure()?.errorText ?? null,
      });
    };

    const onPageError = (error: Error): void => {
      logOrangeHrmDebug(page, 'Page error surfaced during OrangeHRM debug run', {
        errorName: error.name,
        errorMessage: error.message,
      });
    };

    page.on('requestfailed', onRequestFailed);
    page.on('pageerror', onPageError);

    try {
      await use();
    } finally {
      // Drop listeners before attaching artifacts so teardown stays deterministic even
      // when the page is already in a noisy failure state.
      page.off('requestfailed', onRequestFailed);
      page.off('pageerror', onPageError);
      await attachOrangeHrmDebugLog(page, testInfo);
    }
  }, { auto: true }],
});

export { expect } from '@playwright/test';

function isRelevantOrangeHrmRequest(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Most requests during a run are third-party assets, so match the OrangeHRM host
    // directly and keep the admin-users helper as an explicit endpoint-level fallback.
    return parsedUrl.hostname.includes('orangehrmlive.com') || isOrangeHrmAdminUsersUrl(url);
  } catch {
    // Some framework callbacks can surface non-absolute URLs; fall back to the
    // endpoint matcher so those cases still participate in debug capture.
    return isOrangeHrmAdminUsersUrl(url);
  }
}
