import { SQLQueryListResponse } from "../../../commons/types/type";

export class Customer {
  id: number;
  username: string;
  language: string;
  emailAddress: string;
  nellysCoinUserId: number;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
} 

export class GetCustomerResponse {
  message: string;
  data: Customer;
}

export class GetCustomersResponse {
  message: string;
  data: SQLQueryListResponse;
}
