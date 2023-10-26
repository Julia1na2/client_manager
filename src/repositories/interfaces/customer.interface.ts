import {
    CustomerFilterParams,
    CustomerFilterParamsWithLimits,
    SaveCustomerParams,
    UpdateCustomerParams
} from "../entities/customer.entity";


export interface ICustomerRepository {
  saveCustomer(params: SaveCustomerParams): Promise<any>;
  retrieveCustomer(params: CustomerFilterParams): Promise<any>;
  retrieveCustomers(params: CustomerFilterParamsWithLimits): Promise<any>;
  updateCustomerById(customerId: number, params: UpdateCustomerParams): Promise<any>;
  updateCustomerByNellysCoinId(nellysCoinUserId: number, params: UpdateCustomerParams): Promise<any>;
}