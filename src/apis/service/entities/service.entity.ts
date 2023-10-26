import { SQLQueryListResponse } from "../../../commons/types/type";

export class Service {
  id: number;
  code: string;
  friendlyName: string;
  description: string;
  createdBy: number;
  maxClientCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetServiceResponse {
  message: string;
  data: Service;
}

export class GetServicesResponse {
  message: string;
  data: SQLQueryListResponse;
}
