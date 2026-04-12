import { test } from '../../../src/fixtures/orangehrm/auth.fixture';
import { ClaimPage } from '../../../src/pages/orangehrm/claim.page';

test.describe('OrangeHRM employee claims', () => {
  let claimPage: ClaimPage;

  test.beforeEach(async ({ loggedInPage }) => {
    claimPage = new ClaimPage(loggedInPage);
    await claimPage.open();
  });

  test('filters claims by reference id and status', async () => {
    // The claim data is live, so use a row that is already present before applying
    // a more specific filter combination.
    const claim = await claimPage.readFirstListedClaim();

    await test.step('Search for the claim by reference id and status', async () => {
      await claimPage.searchClaims({
        referenceId: claim.referenceId,
        status: claim.status,
      });
    });

    await test.step('Verify the filtered claim remains visible and matches the selected status', async () => {
      await claimPage.expectClaimVisible(claim);
      await claimPage.expectResultsCompatibleWithSearch({
        referenceId: claim.referenceId,
        status: claim.status,
      });
    });
  });

  test('shows no claims for an unknown reference id', async () => {
    const missingReferenceId = `CLAIM-${Date.now()}`;

    await test.step('Search for a claim reference that should not exist', async () => {
      await claimPage.searchClaimByReferenceId(missingReferenceId);
    });

    await test.step('Verify no matching employee claim is returned', async () => {
      await claimPage.expectNoResultsForReferenceId(missingReferenceId);
    });
  });
});
