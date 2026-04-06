import type { UserRole, UserStatus } from '../../pages/orangehrm/admin.page';
import type { AdminUsersTableRow } from '../../pages/orangehrm/components/admin-users-table.component';

type OrangeHrmMockEmployee = {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  terminationId?: number | null;
};

export type OrangeHrmMockAdminUser = {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  employee: OrangeHrmMockEmployee;
};

export type OrangeHrmAdminUsersApiEmployee = {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  terminationId: number | null;
};

export type OrangeHrmAdminUsersApiUserRole = {
  id: number;
  name: UserRole;
  displayName: UserRole;
};

export type OrangeHrmAdminUsersApiUser = {
  id: number;
  userName: string;
  deleted: boolean;
  status: boolean;
  employee: OrangeHrmAdminUsersApiEmployee;
  userRole: OrangeHrmAdminUsersApiUserRole;
};

export type OrangeHrmAdminUsersResponse = {
  data: OrangeHrmAdminUsersApiUser[];
  meta: {
    total: number;
  };
  rels: unknown[];
};

export function buildOrangeHrmAdminUsersResponse(
  users: OrangeHrmMockAdminUser[],
): OrangeHrmAdminUsersResponse {
  return {
    data: users.map((user) => buildOrangeHrmAdminUsersApiUser(user)),
    meta: {
      total: users.length,
    },
    rels: [],
  };
}

export function buildOrangeHrmAdminUsersTableRows(
  users: OrangeHrmMockAdminUser[],
): AdminUsersTableRow[] {
  return users.map((user) => ({
    username: user.username,
    role: user.role,
    employeeName: buildEmployeeDisplayName(user.employee),
    status: user.status,
  }));
}

function buildEmployeeDisplayName(employee: OrangeHrmMockEmployee): string {
  // OrangeHRM's Admin users table currently renders first + last name only,
  // even though the API payload includes middleName.
  return [employee.firstName, employee.lastName]
    .filter((namePart): namePart is string => !!namePart && namePart.trim().length > 0)
    .join(' ');
}

function buildOrangeHrmAdminUsersApiUser(
  user: OrangeHrmMockAdminUser,
): OrangeHrmAdminUsersApiUser {
  return {
    id: user.id,
    userName: user.username,
    deleted: false,
    status: user.status === 'Enabled',
    employee: {
      empNumber: user.employee.empNumber,
      employeeId: user.employee.employeeId,
      firstName: user.employee.firstName,
      middleName: user.employee.middleName ?? '',
      lastName: user.employee.lastName,
      terminationId: user.employee.terminationId ?? null,
    },
    userRole: {
      id: user.role === 'Admin' ? 1 : 2,
      name: user.role,
      displayName: user.role,
    },
  };
}
