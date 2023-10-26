import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientValidator } from './client.validator';
import { GetClientHistoriesParams, GetClientParams, UpdateClientDto, createClientDto} from './dtos/client.dto';
import { I18n, I18nContext, logger } from 'nestjs-i18n';
import { ResponseWithData, Response } from '../../commons/responses/response';
import { SlackCloudNotificationAlert } from '../../helpers/slack.notification';
import { ClientScope, ClientStatus, Constants } from '../../commons/enums/constants.enum';
import { ClientHelper } from '../../helpers/client.helper';
import { Client } from './entities/client.entity';
import ShortUniqueId from 'short-unique-id';
import { config } from '../../config/config';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly clientValidator: ClientValidator,
    private readonly clientHelper: ClientHelper,
  ) {}

  async createClient(dto: createClientDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer ): Promise<ResponseWithData> {
    try {
        const validateClient = await this.clientValidator.validateCreateClientDto(dto,i18n);
        if (validateClient.status !== HttpStatus.OK) return validateClient;
        console.log('Token is', bearerTokenUser.id);
      
        const publicId = new ShortUniqueId({ length: config.apiClientIdLength }).randomUUID();
        const secretKey = new ShortUniqueId({ length: config.apiClientSecretLength }).randomUUID();
        const hashSecret = await this.clientHelper.hashSecret(secretKey);
        const client = await this.clientRepository.saveClientAndHistory({
          publicId,
          friendlyName: dto.friendlyName,
          serviceId: dto.serviceId,
          shouldExpire: dto.shouldExpire,
          shouldApplyIPCheck: dto.shouldApplyIPCheck,
          expiresAt: dto.expireAt,
          scope: dto.scope.toUpperCase() as ClientScope,
          status: ClientStatus.ACTIVE,
          wasRegenerated: false,
          secretKey: hashSecret,
          createdBy: bearerTokenUser.id
        });
        
        return Response.withData(HttpStatus.CREATED, i18n.t(`client.clientCreatedSuccessfully`), { ...client, secretKey });
    } catch (error) {
      const errorMessage = `An error occurred in createClient: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
      }
  }

  async findClients(params: GetClientParams,@I18n() i18n: I18nContext,bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const validateGetClientParams = await this.clientValidator.validateGetClientsParams(params, i18n);
      if (validateGetClientParams.status !== HttpStatus.OK) return validateGetClientParams;

      const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE ? Number(params.limit) : Constants.SQL_DEFAULT_LIMIT_VALUE;
      const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

      let filterParams: any = { limit, offset };
      filterParams = params.scope ? { ...filterParams, scope: `${params.scope}`.toUpperCase() } : filterParams;
      filterParams = params.publicId ? { ...filterParams, publicId: params.publicId } : filterParams;
      filterParams = params.friendlyName ? { ...filterParams, friendlyName: params.friendlyName } : filterParams;
      filterParams = params.serviceId ? { ...filterParams, serviceId: Number(params.serviceId) } : filterParams;

      const service = await this.clientRepository.retrieveClients(filterParams);

      return Response.withData(HttpStatus.OK, i18n.t('client.clientsRetrievedSuccessfully'), service);
    } catch (error) {
      const errorMessage = `An error occurred in findClients: ${JSON.stringify(params)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async findClient(clientId: number, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<any> {
    try {
      const validateResult = await this.clientValidator.validateGetClientParams(clientId, i18n);
      if (validateResult.status !== HttpStatus.OK) return validateResult;

      const client = validateResult.data.client;

      return Response.withData(HttpStatus.OK, i18n.t('client.clientRetrievedSuccessfully'), client);
    } catch (error) {
      const errorMessage = `An error occurred in findClient: ${clientId} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR,i18n.t('server.serverError'));
    }
  }

  async findClientHistories(params: GetClientHistoriesParams, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const validateGetClientParams = await this.clientValidator.validateGetClientHistoriesParams(params,i18n);
      if (validateGetClientParams.status !== HttpStatus.OK) return validateGetClientParams;

      const limit =params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE ? Number(params.limit) : Constants.SQL_DEFAULT_LIMIT_VALUE;
      const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

      let filterParams: any = { limit, offset };
      filterParams = params.clientId ? { ...filterParams, clientId: Number(params.clientId) } : filterParams;
      filterParams = params.createdBy ? { ...filterParams, createdBy: Number(params.createdBy) } : filterParams;

      const clientHistories = await this.clientRepository.retrieveAllClientHistories(filterParams);

      return Response.withData(HttpStatus.OK,i18n.t('client.clientHistoriesRetrievedSuccessfully'),clientHistories);
    } catch (error) {
      const errorMessage = `An error occurred in findClientHistories: ${JSON.stringify(params)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR,i18n.t('server.serverError'));
    }
  }

  async updateClient(clientId: number,dto: UpdateClientDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const validateUpdates = await this.clientValidator.validateUpdateClientParams(clientId,dto,i18n);
      if (validateUpdates.status !== HttpStatus.OK) return validateUpdates;

      let client = validateUpdates.data.client as Client;
      client = await this.clientRepository.updateClientAndHistory(client.id, {
        reason: dto.reason,
        updatedBy: bearerTokenUser.id,
        friendlyName: dto.friendlyName ? dto.friendlyName : client.friendlyName,
      });

      return Response.withData(HttpStatus.OK,i18n.t('client.clientUpdatedSuccessfully'), client);
    } catch (error) {
      const errorMessage = `An error occurred in updateClient: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR,i18n.t('server.serverError'));
    }
  }
}
