export class createServiceDto {
  friendlyName: string;
  description: string;
  maxClientCount?: number;
}

export class GetServiceParams {
  code?: string;
  limit?: number;
  offset?: number;
}

export class GetServiceHistoriesParams {
  serviceId?: number;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

export class UpdateServiceDto {
  reason: string;
  friendlyName?: string;
  description?: string;
  maxClientCount?: number;
}
