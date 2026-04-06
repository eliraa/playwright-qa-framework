import type { Page, Response } from '@playwright/test';
import { ORANGE_HRM_UI_TIMEOUT } from '../../pages/orangehrm/orangehrm.constants';
import {
  matchesOrangeHrmAdminUsersSearchRequest,
  ORANGE_HRM_ADMIN_USERS_API_ROUTE,
  isOrangeHrmAdminUsersRequest,
  isOrangeHrmAdminUsersResponse,
} from './admin-users.api';
import type { OrangeHrmAdminUsersResponse } from './admin-users.mock';

export type MockAdminUsersSearchOptions = {
  username: string;
  responseBody: OrangeHrmAdminUsersResponse;
};

export type MockAdminUsersSearchHandle = {
  getMatchedRequestUrls: () => string[];
  waitForResponse: () => Promise<Response>;
};

export async function mockAdminUsersSearchByUsername(
  page: Page,
  options: MockAdminUsersSearchOptions,
): Promise<MockAdminUsersSearchHandle> {
  const matchedRequestUrls: string[] = [];

  await page.route(ORANGE_HRM_ADMIN_USERS_API_ROUTE, async (route) => {
    const request = route.request();

    if (!isOrangeHrmAdminUsersRequest(request)) {
      await route.fallback();
      return;
    }

    if (!matchesOrangeHrmAdminUsersSearchRequest(request, { username: options.username })) {
      await route.fallback();
      return;
    }

    matchedRequestUrls.push(request.url());

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(options.responseBody),
    });
  });

  return {
    getMatchedRequestUrls: () => [...matchedRequestUrls],
    waitForResponse: () =>
      page.waitForResponse(
        (response) =>
          response.ok()
          && isOrangeHrmAdminUsersResponse(response)
          && matchesOrangeHrmAdminUsersSearchRequest(response, { username: options.username }),
        {
          timeout: ORANGE_HRM_UI_TIMEOUT,
        },
      ),
  };
}
