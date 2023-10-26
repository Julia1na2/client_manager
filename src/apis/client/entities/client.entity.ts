import { SQLQueryListResponse } from '../../../commons/types/type';

export class Client {
  id: number;
  friendlyName?: string | null;
  scope: string;
  serviceId: number;
  publicId: string;
  secretKey: string;
  shouldExpire: boolean;
  status: string;
  wasRegenerated: boolean;
  shouldApplyIPCheck: boolean;
  ipWhitelist?: any | null;
  createdBy: number;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetClientResponse {
  message: string;
  data: Client;
}

export class GetClientsResponse {
  message: string;
  data: SQLQueryListResponse;
}
