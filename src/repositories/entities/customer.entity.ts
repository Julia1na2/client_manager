export class SaveCustomerParams {
  username: string;
  language: string;
  emailAddress: string;
  nellysCoinUserId: number;
  status: string;
  type: string;
}

export class CustomerFilterParams {
  id?: number;
  username?: string;
  emailAddress?: string;
  nellysCoinUserId?: number;
}

export class CustomerFilterParamsWithLimits extends CustomerFilterParams {
  limit: number;
  offset: number;
}

export class UpdateCustomerParams {
  username?: string;
  emailAddress?: string;
  status?: string;
  type?: string;
  language?: string;
}
