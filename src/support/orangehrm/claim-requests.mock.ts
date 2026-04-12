import type { ClaimRecordSummary } from '../../pages/orangehrm/claim.page';

type OrangeHrmMockClaimEmployee = {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  terminationId?: number | null;
};

type OrangeHrmMockClaimEvent = {
  id: number;
  name: string;
};

type OrangeHrmMockClaimCurrency = {
  id: string;
  name: string;
};

export type OrangeHrmMockClaimRequest = {
  id: number;
  referenceId: string;
  status: string;
  employee: OrangeHrmMockClaimEmployee;
  claimEvent: OrangeHrmMockClaimEvent;
  currencyType: OrangeHrmMockClaimCurrency;
  description?: string | null;
  amount: number;
  submittedDate?: string | null;
};

export type OrangeHrmClaimRequestsApiEmployee = {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  terminationId: number | null;
};

export type OrangeHrmClaimRequestsApiClaimEvent = {
  id: number;
  name: string;
};

export type OrangeHrmClaimRequestsApiCurrency = {
  id: string;
  name: string;
};

export type OrangeHrmClaimRequestsApiRequest = {
  id: number;
  referenceId: string;
  claimEvent: OrangeHrmClaimRequestsApiClaimEvent;
  currencyType: OrangeHrmClaimRequestsApiCurrency;
  description: string | null;
  status: string;
  employee: OrangeHrmClaimRequestsApiEmployee;
  amount: number;
  submittedDate: string | null;
};

export type OrangeHrmClaimRequestsResponse = {
  data: OrangeHrmClaimRequestsApiRequest[];
  meta: {
    total: number;
  };
  rels: unknown[];
};

export function buildOrangeHrmClaimRequestsResponse(
  claims: OrangeHrmMockClaimRequest[],
): OrangeHrmClaimRequestsResponse {
  return {
    data: claims.map((claim) => buildOrangeHrmClaimRequestsApiRequest(claim)),
    meta: {
      total: claims.length,
    },
    rels: [],
  };
}

export function buildOrangeHrmClaimTableRows(
  claims: OrangeHrmMockClaimRequest[],
): ClaimRecordSummary[] {
  return claims.map((claim) => ({
    referenceId: claim.referenceId,
    employeeName: buildEmployeeDisplayName(claim.employee),
    eventName: claim.claimEvent.name,
    status: buildStatusDisplayLabel(claim.status),
  }));
}

function buildEmployeeDisplayName(employee: OrangeHrmMockClaimEmployee): string {
  // The Claim table currently renders first + last name only, even when the payload
  // carries a middleName.
  return [employee.firstName, employee.lastName]
    .filter((namePart): namePart is string => !!namePart && namePart.trim().length > 0)
    .join(' ');
}

function buildStatusDisplayLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((statusPart) => statusPart.charAt(0).toUpperCase() + statusPart.slice(1))
    .join(' ');
}

function buildOrangeHrmClaimRequestsApiRequest(
  claim: OrangeHrmMockClaimRequest,
): OrangeHrmClaimRequestsApiRequest {
  return {
    id: claim.id,
    referenceId: claim.referenceId,
    claimEvent: {
      id: claim.claimEvent.id,
      name: claim.claimEvent.name,
    },
    currencyType: {
      id: claim.currencyType.id,
      name: claim.currencyType.name,
    },
    description: claim.description ?? null,
    status: claim.status,
    employee: {
      empNumber: claim.employee.empNumber,
      employeeId: claim.employee.employeeId,
      firstName: claim.employee.firstName,
      middleName: claim.employee.middleName ?? '',
      lastName: claim.employee.lastName,
      terminationId: claim.employee.terminationId ?? null,
    },
    amount: claim.amount,
    submittedDate: claim.submittedDate ?? null,
  };
}
