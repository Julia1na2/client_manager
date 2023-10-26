export class SaveServiceParams {
  code: string;
  friendlyName: string;
  description: string;
  createdBy: number;
  maxClientCount?: number;
}

export class ServiceFilterParams {
  id?: number;
  maxClientCount?: number;
  serviceId?: number;
  createdBy?: number;
  friendlyName?: string;
  code?: string;
}

export class ServiceFilterParamsWithLimits extends ServiceFilterParams {
  limit: number;
  offset: number;
}

export class UpdateServiceParams {
  reason: string;
  updatedBy: number;
  friendlyName?: string;
  description?: string;
  maxClientCount?: number | null;
}
