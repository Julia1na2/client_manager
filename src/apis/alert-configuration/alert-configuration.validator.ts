import { ServiceRepository } from '../../repositories/service.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import {CreateAlertConfigurationDto,GetAlertConfigurationHistoryParams,GetAlertConfigurationParams,UpdateAlertConfigurationDto} from './dtos/alert-configuration.dto';
import {Response,ResponseWithData,ResponseWithoutData} from '../../commons/responses/response';
import * as Joi from 'joi';
import { Utils } from '../../utils/utils';
import { JoiValidator } from '../../utils/joi-validator.utils';
import { AlertConfigurationRepository } from '../../repositories/alert-configuration.repository';
import { I18n, I18nContext } from 'nestjs-i18n';

@Injectable()
export class AlertConfigurationValidator {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly alertConfigurationRepository: AlertConfigurationRepository
  ) { }

  async validateCreateAlertConfigurationDto(dto: CreateAlertConfigurationDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<CreateAlertConfigurationDto> = Joi.object({
          sendSlackAlert: Joi.boolean().required().label('Indicator to send slack alert'),
          sendEmail: Joi.boolean().optional().label('Indicator to send email'),
          serviceId: Joi.number().positive().integer().optional().label('The service ID'),
          emailAddressRecipients: Joi.array().items(Joi.string().email()).optional().label('The email recipient address'),
        });

        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
        if (validateResults) return resolve(validateResults);

        if (dto.sendEmail && Utils.stringToBoolean(`${dto.sendEmail}`) && !dto.emailAddressRecipients) {
          return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.theListOfEmailAddressRecipientsIsRequired')));
        }

        if (dto.emailAddressRecipients && Array.isArray(dto.emailAddressRecipients) && !dto.emailAddressRecipients.length) {
          return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.theListOfEmailAddressRecipientsCanNotBeEmpty')));
        }

        let service = undefined;
        let existingConfiguration = undefined;

        if (dto.serviceId) {
          service = await this.serviceRepository.retrieveService({ id: Number(dto.serviceId) });
          if (!service) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('service.serviceNotFound')));

          existingConfiguration = await this.alertConfigurationRepository.retrieveAlertConfiguration({ serviceId: service.id });
          if (existingConfiguration) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.alertConfigurationAlreadyExists')));
        }

        existingConfiguration = await this.alertConfigurationRepository.retrieveAlertConfiguration({ serviceId: null });
        if (existingConfiguration && !service) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.alertConfigurationAlreadyExists')));

        return resolve(Response.withData(HttpStatus.OK, 'OK', { service }));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
      }
    });
  }

  async validateGetAlertConfigurationParams(params: GetAlertConfigurationParams, @I18n() i18n: I18nContext): Promise<ResponseWithoutData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<GetAlertConfigurationParams> = Joi.object({
          sendSlackAlert: Joi.boolean().strip().optional().label('Indicator to send slack alert'),
          sendEmail: Joi.boolean().strip().optional().label('Indicator to send email'),
          serviceId: Joi.number().positive().integer().optional().label('The service ID'),
          limit: Joi.number().integer().min(1).optional().label('The limit'),
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

  async validateGetAlertConfigurationHistoryParams(params: GetAlertConfigurationHistoryParams, @I18n() i18n: I18nContext): Promise<ResponseWithoutData> {
    return new Promise(async (resolve, reject) => {
        try {
            const joiSchema: Joi.ObjectSchema<GetAlertConfigurationHistoryParams> = Joi.object({
                serviceId: Joi.number().positive().integer().min(1).optional().label('The service id'),
                createdBy: Joi.number().positive().integer().min(1).optional().label('The ID of the author of the history'),
                limit: Joi.number().integer().min(1).optional().label('The limit'),
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

  async validateUpdateAlertConfigurationDto(alertConfigurationId: number, dto: UpdateAlertConfigurationDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
    return new Promise(async (resolve, reject) => {
      try {
        const joiSchema: Joi.ObjectSchema<UpdateAlertConfigurationDto> = Joi.object({
          reason: Joi.string().trim().strip().required().label('Reason for the update'),
          sendSlackAlert: Joi.boolean().strip().optional().default(true).label('Indicator to send slack alert'),
          sendEmail: Joi.boolean().strip().optional().default(false).label('Indicator to send email'),
          serviceId: Joi.number().positive().integer().optional().label('The service ID'),
          emailAddressRecipients: Joi.array().items(Joi.string().email()).optional().label('The list of email address recipients'),
        });

        const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
        if (validateResults) return resolve(validateResults);

        const alertConfiguration = await this.alertConfigurationRepository.retrieveAlertConfiguration({ id: Number(alertConfigurationId) });
        if (!alertConfiguration) return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('alert-configuration.alertConfigurationNotFound')));

        if (dto.sendEmail && Utils.stringToBoolean(`${dto.sendEmail}`)) {
          if (!dto.emailAddressRecipients) {
            return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.theListOfEmailAddressRecipientsIsRequired')));
          }

          if (Array.isArray(dto.emailAddressRecipients) && !dto.emailAddressRecipients.length) {
            return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.theListOfEmailAddressRecipientsCanNotBeEmpty')));
          }
        }

        let service = undefined;
        if (dto.serviceId) {
          service = await this.serviceRepository.retrieveService({ id: Number(dto.serviceId) });
          if (!service) return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('service.serviceNotFound')));

          const existingConfiguration = await this.alertConfigurationRepository.retrieveAlertConfiguration({ serviceId: service.id });
          if (
            (existingConfiguration && !alertConfiguration.serviceId) ||
            (existingConfiguration && alertConfiguration.serviceId && existingConfiguration.serviceId !== alertConfiguration.serviceId)
          ) {
            return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('alert-configuration.alertConfigurationAlreadyExists')));
          }
        }

        return resolve(Response.withData(HttpStatus.OK, 'OK', { alertConfiguration, service }));
      } catch (error) {
        return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
      }
    });
  }
}
