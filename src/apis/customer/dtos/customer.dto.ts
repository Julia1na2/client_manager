export class SaveCustomerDto{
  username: string;
  language: string;
  emailAddress: string;
  nellysCoinUserId: number;
  status: string;
  type: string;
}

export class GetCustomersParams {
  username?: string;
  nellysCoinUserId?: number;
  limit?: number;
  offset?: number;
}

export class UpdateCustomerDto{
    oldUsername: string;
    newUsername?: string;
    emailAddress?: string;
    status?: string;
    type?: string;
}