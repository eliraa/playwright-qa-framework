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

    registerOrangeHrmDebugSession(page);
    logOrangeHrmDebug(page, 'OrangeHRM debug capture enabled', {
      testTitle: testInfo.title,
      project: testInfo.project.name,
    });

    const onRequestFailed = (request: Request): void => {
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

    return parsedUrl.hostname.includes('orangehrmlive.com') || isOrangeHrmAdminUsersUrl(url);
  } catch {
    return isOrangeHrmAdminUsersUrl(url);
  }
}
