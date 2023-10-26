export class createClientDto {
  friendlyName?: string | null;
  scope: string;
  serviceId: number;
  shouldExpire?: boolean;
  shouldApplyIPCheck?: boolean;
  ipWhitelist?: string[];
  expireAt?: Date;
}

export class createClientValidate{
  shouldExpire: boolean;
  shouldApplyIPCheck: boolean;
  ipWhitelist?: string[];
  expireAt?: Date;
}

export class GetClientParams {
  publicId?: string;
  scope?: string;
  friendlyName?: string;
  serviceId?: number;
  limit?: number;
  offset?: number;
}

export class GetClientHistoriesParams {
  clientId?: number;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

export class UpdateClientDto {
  scope?: string;
  serviceId?: number;
  reason: string;
  shouldExpire?: boolean;
  expiresAt?: Date;
  shouldApplyIPCheck?: boolean;
  ipWhitelist?: string[];
  status?: string;
  friendlyName?: string | null;
}
