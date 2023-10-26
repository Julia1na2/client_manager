import { ClientScope, ClientStatus } from '../../commons/enums/constants.enum';

export class SaveClientParams {
  friendlyName?: string | null;
  scope: ClientScope;
  serviceId: number;
  publicId: string;
  secretKey: string;
  shouldExpire?: boolean;
  shouldApplyIPCheck?: boolean;
  ipWhitelist?: string[];
  expiresAt?: Date;
  status: ClientStatus;
  wasRegenerated: boolean;
  createdBy: number;
}

export class ClientFilterParams {
  id?: number;
  clientId?: number;
  publicId?: string;
  friendlyName?: string | null;
  serviceId?: number;
}

export class ClientFilterParamsWithLimits extends ClientFilterParams {
  limit: number;
  offset: number;
}

export class UpdateClientParams {
  updatedBy: number;
  reason: string;
  scope?: ClientScope;
  serviceId?: number;
  shouldExpire?: boolean;
  expiresAt?: Date;
  shouldApplyIPCheck?: boolean;
  ipWhitelist?: any;
  status?: ClientStatus;
  friendlyName?: string | null;
}
