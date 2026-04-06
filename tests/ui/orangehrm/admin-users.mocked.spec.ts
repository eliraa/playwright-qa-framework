import { AdminPage, type AdminUsersTableRow } from '../../../src/pages/orangehrm/admin.page';
import { expect, test } from '../../../src/fixtures/orangehrm/auth.fixture';
import {
  buildOrangeHrmAdminUsersResponse,
  buildOrangeHrmAdminUsersTableRows,
  type OrangeHrmMockAdminUser,
} from '../../../src/support/orangehrm/admin-users.mock';
import { mockAdminUsersSearchByUsername } from '../../../src/support/orangehrm/admin-users.network';
import {
  getOrangeHrmAdminUsersQuery,
  ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY,
} from '../../../src/support/orangehrm/admin-users.api';
import { expectOrangeHrmAdminUsersResponseContract } from '../../../src/support/orangehrm/admin-users.contract';

// Use a deterministic filter value so the search action is easy to understand when reading
// the test. The string only needs to trigger the request shape we want to intercept.
const searchUsername = 'mock-admin';

// This controlled dataset is the heart of the test.
// We intentionally include:
// - more than one row, so the test proves the table can render a list and not just a single row
// - different roles and statuses, so the assertions cover meaningful UI variation
// - a middle name on one user, so the test documents the current OrangeHRM UI behavior
//   where the Admin table shows first + last name rather than the full API name payload
const mockedUsers: OrangeHrmMockAdminUser[] = [
  {
    id: 9101,
    username: 'mock-admin-primary',
    role: 'Admin',
    status: 'Enabled',
    employee: {
      empNumber: 9101,
      employeeId: 'EMP-9101',
      firstName: 'Ava',
      lastName: 'Stone',
    },
  },
  {
    id: 9102,
    username: 'mock-admin-reviewer',
    role: 'ESS',
    status: 'Disabled',
    employee: {
      empNumber: 9102,
      employeeId: 'EMP-9102',
      firstName: 'Liam',
      middleName: 'Noel',
      lastName: 'Carter',
    },
  },
];

// Convert the mocked backend records into the exact table rows we expect to see in the UI.
// Keeping this separate from the raw API payload makes the test read like:
// backend contract in -> UI contract out.
const expectedRows: AdminUsersTableRow[] = buildOrangeHrmAdminUsersTableRows(mockedUsers);

test.describe('OrangeHRM admin users with mocked backend data', () => {
  test('renders controlled users table results from a mocked Admin Users response', async ({ loggedInPage }) => {
    // The auth fixture gets us into an authenticated OrangeHRM session so this spec can stay
    // focused on the Admin Users behavior rather than repeating login steps.
    const adminPage = new AdminPage(loggedInPage);

    // Build a realistic response body instead of inlining JSON in the spec.
    // That keeps the test readable and makes the backend payload reusable if we later add
    // empty-state or error-state variants.
    const mockedResponseBody = buildOrangeHrmAdminUsersResponse(mockedUsers);

    // Register the route before the UI triggers the search request.
    // This is important because route interception must be in place before the action that
    // causes the network call, otherwise the test can race the real backend.
    const mockedSearch = await mockAdminUsersSearchByUsername(loggedInPage, {
      username: searchUsername,
      responseBody: mockedResponseBody,
    });

    await test.step('Open the Admin Users page', async () => {
      await adminPage.open();
    });

    // Start waiting for the specific mocked response before clicking Search.
    // This avoids a timing race where the request could complete before the test begins
    // listening for it.
    const mockedUsersResponse = mockedSearch.waitForResponse();

    await test.step('Trigger the controlled users search through the UI', async () => {
      // Drive the page the same way a user would: enter the filter in the UI and submit it.
      // The page object owns the interaction details; the spec only expresses the intent.
      await adminPage.searchUserByUsername(searchUsername);
    });

    await test.step('Validate the triggered Admin Users response contract', async () => {
      // The response validation is deliberately secondary.
      // The goal is not to "prove our own mock" in isolation, but to confirm that:
      // - the expected request was actually triggered
      // - the response shape contains the key fields the frontend depends on
      const response = await mockedUsersResponse;
      const payload = await response.json();
      const responseQuery = getOrangeHrmAdminUsersQuery(response);

      // Confirm the UI action hit the exact Admin Users request contract we intend to control.
      expect(responseQuery.get('username')).toBe(searchUsername);
      expect(responseQuery.get('limit')).toBe(ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.limit);
      expect(responseQuery.get('offset')).toBe(ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.offset);
      expect(responseQuery.get('sortField')).toBe(ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.sortField);
      expect(responseQuery.get('sortOrder')).toBe(ORANGE_HRM_ADMIN_USERS_DEFAULT_QUERY.sortOrder);

      // Confirm the route helper intercepted exactly that request.
      expect(mockedSearch.getMatchedRequestUrls()).toEqual([response.url()]);

      // Validate the real response contract at runtime instead of relying on a TypeScript cast.
      // This catches wrong property names, wrong nesting, and wrong primitive types.
      expectOrangeHrmAdminUsersResponseContract(payload, mockedUsers);
    });

    await test.step('Validate the UI renders the mocked users table rows', async () => {
      // This is the primary proof of value in the test:
      // the frontend renders the controlled backend data correctly.
      // We verify row count, row content, and a coarse text signal in the table.
      await adminPage.expectVisibleRowCount(expectedRows.length);
      await adminPage.expectVisibleRows(expectedRows);
      await adminPage.expectResultsToContain('mock-admin');
    });
  });
});
