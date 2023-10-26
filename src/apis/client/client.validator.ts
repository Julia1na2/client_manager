import { HttpStatus, Injectable } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseWithoutData, Response, ResponseWithData } from '../../commons/responses/response';
import { ClientRepository } from '../../repositories/client.repository';
import { GetClientHistoriesParams, GetClientParams, UpdateClientDto, createClientDto} from './dtos/client.dto';
import * as Joi from 'joi';
import { JoiValidator } from '../../utils/joi-validator.utils';
import { Utils } from '../../utils/utils';
import { ServiceRepository } from '../../repositories/service.repository';
import { ClientScope } from '../../commons/enums/constants.enum';

@Injectable()
export class ClientValidator {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async validateCreateClientDto(dto: createClientDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<createClientDto> = Joi.object({
          scope: Joi.string().trim().strip().required().label('The scope'),
          friendlyName: Joi.string().trim().required().label('The friendly name'),
          serviceId: Joi.number().integer().min(1).required().label('The serviceId'),
          shouldExpire: Joi.boolean().optional().label('Should it expire?'),
          shouldApplyIPCheck: Joi.boolean().optional().label('Should we apply an IP check?'),
          ipWhitelist: Joi.array().items(Joi.string().ip()).optional().label('The list of IPs'),
          expireAt: Joi.date().optional().label('The expiring date'),
        });
        
        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
        if (validateResults) return resolve(validateResults);
        
        let existingService = await this.serviceRepository.retrieveService({ id: Number(dto.serviceId)});
        if (!existingService) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('service.serviceNotFound')));
    
        let existingClient = await this.clientRepository.retrieveClient({friendlyName: dto.friendlyName});
        if (existingClient) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.clientWithFriendlyNameAlreadyExists')));

        if (!Object.values(ClientScope).includes(`${dto.scope}`.toUpperCase() as ClientScope)) {
          return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('client.invalidClientScope')));
        }
    
        if (dto.shouldApplyIPCheck) {
          if (Utils.stringToBoolean(`${dto.shouldApplyIPCheck}`) === true) {
            if (!dto.ipWhitelist) {
              return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.theIpWhitelistIsRequired')),
              );
            }
          }
        
          if (dto.ipWhitelist) {
            if (Array.isArray(dto.ipWhitelist) && dto.ipWhitelist.length === 0) {
              return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.theIPWhiteListCanNotBeEmpty')),
              );
            }
          }
        }
      
        if (dto.shouldExpire) {
          if (Utils.stringToBoolean(`${dto.shouldExpire}`) === true) {
            if (!dto.expireAt) {
              return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.theExpiringDateIsRequired')),
              );
            }
          }
        }
      
        const clients = await this.serviceRepository.retrieveTotalActiveClientCount(dto.serviceId)
        if (existingService.maxClientCount) {
          if(existingService.maxClientCount < Number(clients)){
          return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('service.serviceReachedItsMaximumNumberOfClients')))
          }
        }
    
        return resolve(Response.withoutData(HttpStatus.OK, 'OK'));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
      }
    });
  }

  async validateGetClientsParams(params: GetClientParams, @I18n() i18n: I18nContext,): Promise<ResponseWithoutData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<GetClientParams> = Joi.object({
          scope: Joi.string().trim().strip().optional().label('The scope'),
          friendlyName: Joi.string().trim().strip().optional().label('The friendlyname'),
          publicId: Joi.string().trim().strip().optional().label('The public ID'),
          serviceId: Joi.number().optional().label('The service ID'),
          limit: Joi.number().integer().min(1).optional().label('The limit'),
          offset: Joi.number().integer().min(0).optional().label('The offset')
        });

        const validateResults = await JoiValidator.validate({joiSchema: joiSchema,data: params});
        if (validateResults) return resolve(validateResults);

        return resolve(Response.withoutData(HttpStatus.OK, 'OK'));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(params)}`);
      }
    });
  }

  async validateGetClientParams(clientId: number,@I18n() i18n: I18nContext): Promise<ResponseWithData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema = Joi.object({
          clientId: Joi.number().positive().integer().min(1).required().label('The client Id'),
        });

        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: { clientId } });
        if (validateResults) return resolve(validateResults);

        const client = await this.clientRepository.retrieveClient({ id: Number(clientId) });
        if (!client) return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('client.clientNotFound')));

        return resolve(Response.withData(HttpStatus.OK, 'OK', { client }));
      } catch (error) {
        return reject(`An error occured during param validation: ${clientId}`);
      }
    });
  }

  async validateGetClientHistoriesParams(params: GetClientHistoriesParams,@I18n() i18n: I18nContext,): Promise<ResponseWithoutData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<GetClientHistoriesParams> =
          Joi.object({
            clientId: Joi.number().positive().integer().min(1).optional().label('The client id'),
            createdBy: Joi.number().positive().integer().min(1).optional().label('The ID of the author of the history'),
            limit: Joi.number().positive().integer().min(1).optional().label('The limit'),
            offset: Joi.number().integer().min(0).optional().label('The offset')
          });

        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: params });
        if (validateResults) return resolve(validateResults);

        return resolve(Response.withoutData(HttpStatus.OK, 'OK'));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(params)}`);
      }
    });
  }

  async validateUpdateClientParams(clientId: number,dto: UpdateClientDto,@I18n() i18n: I18nContext): Promise<ResponseWithData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<UpdateClientDto> = Joi.object({
          scope: Joi.string().trim().strip().optional().label('The scope'),
          friendlyName: Joi.string().trim().strip().optional().label('The friendly name'),
          serviceId: Joi.number().optional().label('The service ID'),
          shouldExpire: Joi.boolean().optional().label('Should it expire?'),
          expiresAt: Joi.date().optional().label('When does it expires'),
          reason: Joi.string().required().label('The reason for the updates'),
          shouldApplyIPCheck: Joi.boolean().optional().label('Should we apply an IP check'),
          ipWhiteList: Joi.array().items(Joi.string()).optional().label('The list of IPs'),
          status: Joi.string().trim().strip().optional().label("The client's status"),
        });

        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
        if (validateResults) return resolve(validateResults);

        const client = await this.clientRepository.retrieveClient({id: Number(clientId)});
        if (!client) return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('client.clientNotFound')));

        let existingClient;
        if (dto.friendlyName) {
          existingClient = await this.clientRepository.retrieveClient({friendlyName: dto.friendlyName});

          if (existingClient && client.id !== existingClient.id) {
            return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.clientWithFriendlyNameAlreadyExists')),
            );
          }
        }

        if (dto.shouldApplyIPCheck) {
          if (Utils.stringToBoolean(`${dto.shouldApplyIPCheck}`) === true) {
            if (!dto.ipWhitelist) {
              return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.theIpWhitelistIsRequired')),
              );
            }
          }
        }

        if (dto.shouldExpire) {
          if (Utils.stringToBoolean(`${dto.shouldExpire}`) === true) {
            if (!dto.expiresAt) {
              return resolve(Response.withoutData(HttpStatus.BAD_REQUEST,i18n.t('client.theExpiringDateIsRequired')),
              );
            }
          }
        }

        if (dto.scope && !Object.values(ClientScope).includes(`${dto.scope}`.toUpperCase() as ClientScope)){
          return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('client.invalidClientScope')));
        }

        return resolve(Response.withData(HttpStatus.OK, 'OK', { client }));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
      }
    });
  }
}
