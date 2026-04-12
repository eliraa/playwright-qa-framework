import { test } from '../../../src/fixtures/orangehrm/auth.fixture';
import { LeavePage, type LeaveSearchCriteria } from '../../../src/pages/orangehrm/leave.page';

const broadTakenLeaveSearch: LeaveSearchCriteria = {
  employeeName: '',
  fromDate: '2024-01-01',
  toDate: '2026-31-12',
  status: 'Taken',
};

test.describe('OrangeHRM leave list', () => {
  let leavePage: LeavePage;

  test.beforeEach(async ({ loggedInPage }) => {
    leavePage = new LeavePage(loggedInPage);
    await leavePage.open();
  });

  test('filters leave records by status, date range, and employee name', async () => {
    await test.step('Search for taken leave entries in a broad date range', async () => {
      await leavePage.searchLeaveRecords(broadTakenLeaveSearch);
    });

    // The live demo can rotate its leave data, so capture a visible record first and
    // then refine the employee filter against that same real dataset.
    const leaveRecord = await leavePage.readFirstListedLeaveRecord();
    await test.step('Refine the leave search with the employee name', async () => {
      await leavePage.searchLeaveRecords({
        ...broadTakenLeaveSearch,
        employeeName: leaveRecord.employeeName,
      });
    });

    await test.step('Verify the filtered results stay aligned with the selected leave status', async () => {
      await leavePage.expectResultsToContainEmployee(leaveRecord.employeeName);
      await leavePage.expectResultsCompatibleWithStatus(broadTakenLeaveSearch.status);
    });
  });

  test('resets the leave filters after a no-results employee search', async () => {
    await test.step('Search for a leave status with no live records in the current date range', async () => {
      await leavePage.searchLeaveRecords({
        ...broadTakenLeaveSearch,
        employeeName: '',
        status: 'Rejected',
      });
    });

    await test.step('Verify the leave list shows no matching records', async () => {
      await leavePage.expectNoResults();
    });

    await test.step('Reset the leave filters back to their default state', async () => {
      await leavePage.resetSearch();
      await leavePage.expectDefaultFilters();
    });
  });
});
