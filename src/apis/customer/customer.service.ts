import { HttpStatus, Injectable } from "@nestjs/common";
import { CustomerRepository } from "../../repositories/customer.repository";
import { CustomerValidator } from "./customer.validator";
import { GetCustomersParams, UpdateCustomerDto } from "./dtos/customer.dto";
import logger from "../../utils/logger";
import { Constants } from "../../commons/enums/constants.enum";
import { ResponseWithData, Response } from "../../commons/responses/response";
import { I18n, I18nContext } from "nestjs-i18n";
import { SlackCloudNotificationAlert } from "../../helpers/slack.notification";
import { Customer } from "./entities/customer.entity";

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerValidator: CustomerValidator
  ) { }

  async findCustomers(params: GetCustomersParams, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    try {
      const validateGetCustomersParams = await this.customerValidator.validateGetCustomersParams(params, i18n);
      if (validateGetCustomersParams.status !== HttpStatus.OK) return validateGetCustomersParams;

      const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE ? Number(params.limit) : Constants.SQL_DEFAULT_LIMIT_VALUE;
      const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

      let filterParams: any = { limit, offset };
      filterParams = params.username ? { ...filterParams, username: params.username } : filterParams;
      filterParams = params.nellysCoinUserId ? { ...filterParams, nellysCoinUserId: Number(params.nellysCoinUserId) } : filterParams;

      const customers = await this.customerRepository.retrieveCustomers(filterParams);
      return Response.withData(HttpStatus.OK, i18n.t('customer.customersRetrievedSuccessfully'), customers);
    } catch (error) {
      const errorMessage = `An error occurred in findCustomers: ${JSON.stringify(params)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async findCustomer(customerId: number, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    try {
      const validateGetCustomer = await this.customerValidator.validateGetCustomerParams(customerId, i18n);
      if (validateGetCustomer.status !== HttpStatus.OK) return validateGetCustomer;

      const customer = validateGetCustomer.data.customer;
      return Response.withData(HttpStatus.OK, i18n.t('customer.customerRetrievedSuccessfully'), customer);
    } catch (error) {
      const errorMessage = `An error occurred in findCustomer: ${customerId} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async updateCustomerByNellysCoinId(nellysCoinUserId: number, dto: UpdateCustomerDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    try {
      const validateUpdateCustomer = await this.customerValidator.validateUpdateCustomerDto(nellysCoinUserId, dto, i18n);
      if (validateUpdateCustomer.status !== HttpStatus.OK) return validateUpdateCustomer;
      let customer = validateUpdateCustomer.data.customer as Customer;

      customer = await this.customerRepository.updateCustomerByNellysCoinId(nellysCoinUserId,
        {
          username: dto.newUsername? dto.newUsername : customer.username,
          emailAddress: dto.emailAddress ? dto.emailAddress : customer.emailAddress,
          status: dto.status ? dto.status : customer.status,
          type: dto.type ? dto.type : customer.type,
        },
      );

      return Response.withData(HttpStatus.OK, i18n.t('customer.customerUpdatedSuccessfully'), customer);
    } catch (error) {
      const errorMessage = `An error occurred in updateCustomerByNellysCoinId: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async updateCustomerById(customerId: number, dto: UpdateCustomerDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    try {
      const validateUpdateCustomer = await this.customerValidator.validateUpdateCustomerDto(customerId, dto, i18n);
      if (validateUpdateCustomer.status !== HttpStatus.OK) return validateUpdateCustomer;

      let customer = validateUpdateCustomer.data.customer as Customer;
      customer = await this.customerRepository.updateCustomerByNellysCoinId(
        customerId,
        {
          username: dto.newUsername ? dto.newUsername : customer.username,
          emailAddress: dto.emailAddress ? dto.emailAddress : customer.emailAddress,
          status: dto.status ? dto.status : customer.status,
          type: dto.type ? dto.type : customer.type,
        },
      );

      return Response.withData(HttpStatus.OK, i18n.t('customer.customerUpdatedSuccessfully'), customer);
    } catch (error) {
      const errorMessage = `An error occurred in updateCustomerById: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }
}
