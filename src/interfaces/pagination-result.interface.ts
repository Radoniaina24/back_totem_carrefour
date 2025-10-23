export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  allLeaveRequests?: number;
  allLeaveRequestsPending?: number;
  allLeaveRequestsApproved?: number;
  allLeaveRequestsRejected?: number;
  allPlannings?: number;
  allPlanningsPlanned?: number;
  allPlanningsInProgress?: number;
  allPlanningsCompleted?: number;
  allPlanningsCanceled?: number;

  allPermissions?: number;
  allPermissionsPending?: number;
  allPermissionsApproved?: number;
  allPermissionsRejected?: number;
}
