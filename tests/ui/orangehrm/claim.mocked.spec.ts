import { expect, test } from '../../../src/fixtures/orangehrm/auth.fixture';
import { ClaimPage, type ClaimRecordSummary } from '../../../src/pages/orangehrm/claim.page';
import {
  buildOrangeHrmClaimRequestsResponse,
  buildOrangeHrmClaimTableRows,
  type OrangeHrmMockClaimRequest,
} from '../../../src/support/orangehrm/claim-requests.mock';
import { mockClaimRequestsSearchByStatus } from '../../../src/support/orangehrm/claim-requests.network';
import {
  getOrangeHrmClaimRequestsQuery,
  ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY,
} from '../../../src/support/orangehrm/claim-requests.api';

const selectedStatus = 'Submitted';
const backendStatus = 'SUBMITTED';

// Keep the filtered status deterministic so the spec can prove that the Claim page
// renders exactly the backend records we inject, not whichever public-demo rows happen
// to be present on the day the test runs.
const mockedClaims: OrangeHrmMockClaimRequest[] = [
  {
    id: 9201,
    referenceId: 'CLM-2026-001',
    status: backendStatus,
    employee: {
      empNumber: 9201,
      employeeId: 'EMP-9201',
      firstName: 'Nina',
      middleName: 'Rose',
      lastName: 'Ivanova',
    },
    claimEvent: {
      id: 3,
      name: 'Travel Allowance',
    },
    currencyType: {
      id: 'EUR',
      name: 'Euro',
    },
    amount: 1250.5,
    submittedDate: '2026-04-10',
  },
  {
    id: 9202,
    referenceId: 'CLM-2026-002',
    status: backendStatus,
    employee: {
      empNumber: 9202,
      employeeId: 'EMP-9202',
      firstName: 'Mark',
      lastName: 'Petrov',
    },
    claimEvent: {
      id: 2,
      name: 'Medical Reimbursement',
    },
    currencyType: {
      id: 'GBP',
      name: 'Pound Sterling',
    },
    description: 'Follow-up specialist visit',
    amount: 640.25,
    submittedDate: '2026-04-09',
  },
];

const expectedClaims: ClaimRecordSummary[] = buildOrangeHrmClaimTableRows(mockedClaims);

test.describe('OrangeHRM employee claims with mocked backend data', () => {
  test('renders deterministic filtered Claim results for a selected status', async ({ loggedInPage }) => {
    const claimPage = new ClaimPage(loggedInPage);
    const mockedResponseBody = buildOrangeHrmClaimRequestsResponse(mockedClaims);
    const mockedSearch = await mockClaimRequestsSearchByStatus(loggedInPage, {
      backendStatus,
      responseBody: mockedResponseBody,
    });

    await test.step('Open the Claim page', async () => {
      await claimPage.open();
    });

    const mockedClaimsResponse = mockedSearch.waitForResponse();

    await test.step('Filter employee claims by the selected status through the UI', async () => {
      await claimPage.searchClaimsByStatus(selectedStatus);
    });

    await test.step('Validate the triggered Claim request shape', async () => {
      const response = await mockedClaimsResponse;
      const payload = await response.json();
      const responseQuery = getOrangeHrmClaimRequestsQuery(response);

      expect(responseQuery.get('status')).toBe(backendStatus);
      expect(responseQuery.get('limit')).toBe(ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.limit);
      expect(responseQuery.get('offset')).toBe(ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.offset);
      expect(responseQuery.get('includeEmployees')).toBe(
        ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.includeEmployees,
      );
      expect(responseQuery.get('sortField')).toBe(ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.sortField);
      expect(responseQuery.get('sortOrder')).toBe(ORANGE_HRM_CLAIM_REQUESTS_DEFAULT_QUERY.sortOrder);

      expect(mockedSearch.getMatchedRequestUrls()).toEqual([response.url()]);
      expect(payload.meta.total).toBe(mockedClaims.length);
    });

    await test.step('Validate the Claim table renders the controlled filtered rows', async () => {
      await claimPage.expectResultsCompatibleWithSearch({ status: selectedStatus });
      await claimPage.expectVisibleClaims(expectedClaims);
    });
  });
});
