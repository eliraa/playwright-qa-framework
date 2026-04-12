import type { Page, Response } from '@playwright/test';
import { ORANGE_HRM_UI_TIMEOUT } from '../../pages/orangehrm/orangehrm.constants';
import {
  isOrangeHrmClaimRequestsRequest,
  isOrangeHrmClaimRequestsResponse,
  matchesOrangeHrmClaimStatusSearchRequest,
  ORANGE_HRM_CLAIM_REQUESTS_API_ROUTE,
} from './claim-requests.api';
import type { OrangeHrmClaimRequestsResponse } from './claim-requests.mock';

export type MockClaimRequestsByStatusOptions = {
  backendStatus: string;
  responseBody: OrangeHrmClaimRequestsResponse;
};

export type MockClaimRequestsHandle = {
  getMatchedRequestUrls: () => string[];
  waitForResponse: () => Promise<Response>;
};

export async function mockClaimRequestsSearchByStatus(
  page: Page,
  options: MockClaimRequestsByStatusOptions,
): Promise<MockClaimRequestsHandle> {
  const matchedRequestUrls: string[] = [];

  await page.route(ORANGE_HRM_CLAIM_REQUESTS_API_ROUTE, async (route) => {
    const request = route.request();

    if (!isOrangeHrmClaimRequestsRequest(request)) {
      await route.fallback();
      return;
    }

    if (!matchesOrangeHrmClaimStatusSearchRequest(request, { backendStatus: options.backendStatus })) {
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
          && isOrangeHrmClaimRequestsResponse(response)
          && matchesOrangeHrmClaimStatusSearchRequest(response, {
            backendStatus: options.backendStatus,
          }),
        {
          timeout: ORANGE_HRM_UI_TIMEOUT,
        },
      ),
  };
}
