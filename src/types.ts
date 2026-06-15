/**
 * TypeScript definitions for Employee Management System (EMS)
 */

export enum SalaryStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  PROCESSING = 'Processing'
}

export interface EmployeeProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  salaryStatus: SalaryStatus;
  statusDate?: string;
  joinedAt: string;
  isAdmin: boolean;
}

export interface CustomRole {
  id: string;
  roleName: string;
  description: string;
  createdBy?: string;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
