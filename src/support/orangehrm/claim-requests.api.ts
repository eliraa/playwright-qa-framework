import type { Request, Response } from '@playwright/test';

export const ORANGE_HRM_CLAIM_REQUESTS_API_PATH = '/web/index.php/api/v2/claim/employees/requests';
export const ORANGE_HRM_CLAIM_REQUESTS_API_ROUTE = `**${ORANGE_HRM_CLAIM_REQUESTS_API_PATH}**`;
export const ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY = {
  limit: '50',
  offset: '0',
  includeEmployees: 'onlyCurrent',
  sortField: 'claimRequest.referenceId',
  sortOrder: 'DESC',
} as const;

type ClaimRequestsUrlSource = string | Request | Response;

export function isOrangeHrmClaimRequestsUrl(url: string): boolean {
  const parsedUrl = new URL(url);

  return (
    parsedUrl.pathname.endsWith('/api/v2/claim/employees/requests')
    && parsedUrl.searchParams.get('model') !== 'summary'
  );
}

export function isOrangeHrmClaimRequestsRequest(request: Request): boolean {
  return request.method() === 'GET' && isOrangeHrmClaimRequestsUrl(request.url());
}

export function isOrangeHrmClaimRequestsResponse(response: Response): boolean {
  return isOrangeHrmClaimRequestsRequest(response.request());
}

export function getOrangeHrmClaimRequestsQuery(source: ClaimRequestsUrlSource): URLSearchParams {
  const url = typeof source === 'string' ? source : source.url();

  return new URL(url).searchParams;
}

export function matchesOrangeHrmClaimStatusSearchRequest(
  source: ClaimRequestsUrlSource,
  filters: {
    backendStatus: string;
  },
): boolean {
  const query = getOrangeHrmClaimRequestsQuery(source);

  return (
    query.get('status') === filters.backendStatus
    && query.get('referenceId') === null
    && query.get('limit') === ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.limit
    && query.get('offset') === ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.offset
    && query.get('includeEmployees') === ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.includeEmployees
    && query.get('sortField') === ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.sortField
    && query.get('sortOrder') === ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.sortOrder
  );
}
