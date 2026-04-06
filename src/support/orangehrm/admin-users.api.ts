import type { Request, Response } from '@playwright/test';

export const ORANGE_HRM_ADMIN_USERS_API_PATH = '/web/index.php/api/v2/admin/users';
export const ORANGE_HRM_ADMIN_USERS_API_ROUTE = `**${ORANGE_HRM_ADMIN_USERS_API_PATH}**`;
export const ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY = {
  limit: '50',
  offset: '0',
  sortField: 'u.userName',
  sortOrder: 'ASC',
} as const;

type AdminUsersUrlSource = string | Request | Response;

export function isOrangeHrmAdminUsersUrl(url: string): boolean {
  return new URL(url).pathname.endsWith('/api/v2/admin/users');
}

export function isOrangeHrmAdminUsersRequest(request: Request): boolean {
  return request.method() === 'GET' && isOrangeHrmAdminUsersUrl(request.url());
}

export function isOrangeHrmAdminUsersResponse(response: Response): boolean {
  return isOrangeHrmAdminUsersRequest(response.request());
}

export function getOrangeHrmAdminUsersQuery(source: AdminUsersUrlSource): URLSearchParams {
  const url = typeof source === 'string' ? source : source.url();

  return new URL(url).searchParams;
}

export function matchesOrangeHrmAdminUsersSearchRequest(
  source: AdminUsersUrlSource,
  filters: {
    username: string;
  },
): boolean {
  const query = getOrangeHrmAdminUsersQuery(source);

  return (
    query.get('username') === filters.username
    && query.get('limit') === ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.limit
    && query.get('offset') === ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.offset
    && query.get('sortField') === ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.sortField
    && query.get('sortOrder') === ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.sortOrder
  );
}
