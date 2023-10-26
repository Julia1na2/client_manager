import { Injectable } from "@nestjs/common";
import { ICustomerRepository } from "./interfaces/customer.interface";
import prisma from "../commons/prisma";
import {CustomerFilterParams,CustomerFilterParamsWithLimits,SaveCustomerParams,UpdateCustomerParams} from "./entities/customer.entity";
import { Customer } from "../apis/customer/entities/customer.entity";
import { SQLQueryListResponse } from "../commons/types/type";

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  saveCustomer(params: SaveCustomerParams): Promise<Customer> {
    return new Promise(async (resolve, reject) => {
      try {
        const customer = await prisma.customer.create({
          data: params
        })
        return resolve(customer)
      } catch (error) {
        return reject(error)
      }
    })
  }

  retrieveCustomer(params: CustomerFilterParams): Promise<Customer | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const customer = await prisma.customer.findFirst({
          where: params,
        });
        return resolve(customer);
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveCustomers(params: CustomerFilterParamsWithLimits): Promise<SQLQueryListResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const { offset, limit, ...queryParams } = params;
        const customerTotalCount = await prisma.customer.count({ where: queryParams });
        const customers = await prisma.customer.findMany({
          where: queryParams,
          take: limit,
          skip: offset,
        });
        return resolve({
          data: customers,
          count: customers.length,
          totalCount: customerTotalCount,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  updateCustomerByNellysCoinId(nellysCoinUserId: number, params: UpdateCustomerParams): Promise<Customer> {
    return new Promise(async (resolve, reject) => {
      try {
        const customer = await prisma.customer.update({
          where: { nellysCoinUserId },
          data: params,
        });

        return resolve(customer);
      } catch (error) {
        return reject(error)
      }
    })
  }

  updateCustomerById(customerId: number, params: UpdateCustomerParams): Promise<Customer> {
    return new Promise(async (resolve, reject) => {
      try {
        const customer = await prisma.customer.update({
          where: { id: customerId },
          data: params,
        });

        return resolve(customer);
      } catch (error) {
        return reject(error)
      }
    })
  }

  resetCustomer() {
    return new Promise(async (resolve, reject) => {
      try {
        await prisma.clientHistory.deleteMany({});
        await prisma.client.deleteMany({});
        await prisma.alertConfigurationHistory.deleteMany({});
        await prisma.alertConfiguration.deleteMany({});
        await prisma.serviceHistory.deleteMany({});
        await prisma.service.deleteMany({});
        await prisma.customer.deleteMany({});
        return resolve('OK');
      } catch (error) {
        return reject(error)
      }
    });
  }
}
