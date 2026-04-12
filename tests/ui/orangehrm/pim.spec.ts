import { test } from '../../../src/fixtures/orangehrm/auth.fixture';
import { PimPage } from '../../../src/pages/orangehrm/pim.page';

test.describe('OrangeHRM PIM employee list', () => {
  let pimPage: PimPage;

  test.beforeEach(async ({ loggedInPage }) => {
    pimPage = new PimPage(loggedInPage);
    await pimPage.open();
  });

  test('finds a listed employee by employee id', async () => {
    // The public demo data changes over time, so anchor the positive search on an
    // employee record that is already visible in the live table.
    const employee = await pimPage.readFirstListedEmployee();

    await test.step('Search for the employee by id', async () => {
      await pimPage.searchEmployeeById(employee.id);
    });

    await test.step('Verify the employee still appears in the filtered results', async () => {
      await pimPage.expectEmployeeVisible(employee);
    });
  });

  test('shows no results for an unknown employee id', async () => {
    const missingEmployeeId = 'EMP99999';

    await test.step('Search for an employee id that should not exist', async () => {
      await pimPage.searchEmployeeById(missingEmployeeId);
    });

    await test.step('Verify the employee list shows no matching record', async () => {
      await pimPage.expectNoResultsForEmployeeId(missingEmployeeId);
    });
  });
});
