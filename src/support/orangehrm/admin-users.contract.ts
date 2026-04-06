import { expect } from '@playwright/test';
import type {
  OrangeHrmAdminUsersApiEmployee,
  OrangeHrmAdminUsersApiUser,
  OrangeHrmAdminUsersApiUserRole,
  OrangeHrmAdminUsersResponse,
  OrangeHrmMockAdminUser,
} from './admin-users.mock';

const adminUsersResponseKeys = ['data', 'meta', 'rels'] as const;
const adminUsersMetaKeys = ['total'] as const;
const adminUsersUserKeys = ['id', 'userName', 'deleted', 'status', 'employee', 'userRole'] as const;
const adminUsersEmployeeKeys = [
  'empNumber',
  'employeeId',
  'firstName',
  'middleName',
  'lastName',
  'terminationId',
] as const;
const adminUsersUserRoleKeys = ['id', 'name', 'displayName'] as const;

export function expectOrangeHrmAdminUsersResponseContract(
  payload: unknown,
  expectedUsers: OrangeHrmMockAdminUser[],
): asserts payload is OrangeHrmAdminUsersResponse {
  const response = expectRecord(payload);

  expectExactKeys(response, adminUsersResponseKeys);
  expect(Array.isArray(response.data)).toBe(true);
  expect(Array.isArray(response.rels)).toBe(true);
  expect(response.rels).toHaveLength(0);

  const meta = expectRecord(response.meta);

  expectExactKeys(meta, adminUsersMetaKeys);
  expect(meta.total).toBe(expectedUsers.length);
  expect(response.data).toHaveLength(expectedUsers.length);

  const responseUsers = response.data as unknown[];

  expectedUsers.forEach((expectedUser, index) => {
    expectOrangeHrmAdminUsersUserContract(responseUsers[index], expectedUser);
  });
}

function expectOrangeHrmAdminUsersUserContract(
  payload: unknown,
  expectedUser: OrangeHrmMockAdminUser,
): asserts payload is OrangeHrmAdminUsersApiUser {
  const user = expectRecord(payload);

  expectExactKeys(user, adminUsersUserKeys);
  expect(user.id).toBe(expectedUser.id);
  expect(user.userName).toBe(expectedUser.username);
  expect(user.deleted).toBe(false);
  expect(typeof user.deleted).toBe('boolean');
  expect(user.status).toBe(expectedUser.status === 'Enabled');
  expect(typeof user.status).toBe('boolean');

  expectOrangeHrmAdminUsersEmployeeContract(user.employee, expectedUser.employee);
  expectOrangeHrmAdminUsersUserRoleContract(user.userRole, expectedUser.role);
}

function expectOrangeHrmAdminUsersEmployeeContract(
  payload: unknown,
  expectedEmployee: OrangeHrmMockAdminUser['employee'],
): asserts payload is OrangeHrmAdminUsersApiEmployee {
  const employee = expectRecord(payload);

  expectExactKeys(employee, adminUsersEmployeeKeys);
  expect(employee.empNumber).toBe(expectedEmployee.empNumber);
  expect(employee.employeeId).toBe(expectedEmployee.employeeId);
  expect(employee.firstName).toBe(expectedEmployee.firstName);
  expect(employee.middleName).toBe(expectedEmployee.middleName ?? '');
  expect(employee.lastName).toBe(expectedEmployee.lastName);
  expect(employee.terminationId).toBe(expectedEmployee.terminationId ?? null);
}

function expectOrangeHrmAdminUsersUserRoleContract(
  payload: unknown,
  expectedRole: OrangeHrmMockAdminUser['role'],
): asserts payload is OrangeHrmAdminUsersApiUserRole {
  const userRole = expectRecord(payload);

  expectExactKeys(userRole, adminUsersUserRoleKeys);
  expect(userRole.id).toBe(expectedRole === 'Admin' ? 1 : 2);
  expect(userRole.name).toBe(expectedRole);
  expect(userRole.displayName).toBe(expectedRole);
}

function expectRecord(value: unknown): Record<string, unknown> {
  expect(value).not.toBeNull();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);

  return value as Record<string, unknown>;
}

function expectExactKeys(record: Record<string, unknown>, expectedKeys: readonly string[]): void {
  expect(Object.keys(record).sort()).toEqual([...expectedKeys].sort());
}
