import { HttpStatus, Injectable } from '@nestjs/common';
import { AlertConfigurationRepository } from '../../repositories/alert-configuration.repository';
import { AlertConfigurationValidator } from './alert-configuration.validator';
import {CreateAlertConfigurationDto,GetAlertConfigurationHistoryParams,GetAlertConfigurationParams,UpdateAlertConfigurationDto} from './dtos/alert-configuration.dto';
import { ResponseWithData, Response } from '../../commons/responses/response';
import logger from '../../utils/logger';
import { Constants } from '../../commons/enums/constants.enum';
import { SlackCloudNotificationAlert } from '../../helpers/slack.notification';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Utils } from '../../utils/utils';
import { Service } from '../service/entities/service.entity';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class AlertConfigurationService {
  constructor(
    private readonly alertConfigurationValidator: AlertConfigurationValidator,
    private readonly alertConfigurationRepository: AlertConfigurationRepository,
  ) {}

  async createAlertConfiguration(dto: CreateAlertConfigurationDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const dtoValidationResponse = await this.alertConfigurationValidator.validateCreateAlertConfigurationDto(dto, i18n);
      if (dtoValidationResponse.status !== HttpStatus.OK) return dtoValidationResponse;

      const service = dtoValidationResponse.data.service as Service | undefined;
      const alertConfiguration = await this.alertConfigurationRepository.saveAlertConfigurationAndHistory({
        createdBy: bearerTokenUser.id,
        sendSlackAlert: dto.sendSlackAlert,
        serviceId: service ? service.id : undefined,
        sendEmail: dto.sendEmail ? dto.sendEmail : undefined,
        emailAddressRecipients: dto.emailAddressRecipients ? JSON.stringify(dto.emailAddressRecipients) : undefined,
      });

      return Response.withData(HttpStatus.CREATED, i18n.t(`alert-configuration.alertConfigurationCreatedSuccessfully`), alertConfiguration);
    } catch (error) {
      const errorMessage = `An error occurred in createAlertConfiguration: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async findAlertConfigurations(params: GetAlertConfigurationParams, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const validateAlertParams = await this.alertConfigurationValidator.validateGetAlertConfigurationParams(params, i18n);
      if (validateAlertParams.status !== HttpStatus.OK) return validateAlertParams;

      const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE ? Number(params.limit) : Constants.SQL_DEFAULT_LIMIT_VALUE;
      const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

      let filterParams: any = { limit, offset };
      filterParams = params.serviceId ? { ...filterParams, serviceId: Number(params.serviceId) } : filterParams;
      filterParams = params.sendEmail ? { ...filterParams, sendEmail: Utils.stringToBoolean(`${params.sendEmail}`) } : filterParams;
      filterParams = params.sendSlackAlert ? { ...filterParams, sendSlackAlert: Utils.stringToBoolean(`${params.sendSlackAlert}`) } : filterParams;

      const alertConfiguration = await this.alertConfigurationRepository.retrieveAlertConfigurations(filterParams);

      return Response.withData(HttpStatus.OK, i18n.t('alert-configuration.alertConfigurationsRetrievedSuccessfully'), alertConfiguration);
    } catch (error) {
      const errorMessage = `An error occurred in findAlertConfigurations: ${JSON.stringify(params)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }

  async findAlertConfigurationHistories(params: GetAlertConfigurationHistoryParams, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
        const validateGetServiceParams = await this.alertConfigurationValidator.validateGetAlertConfigurationHistoryParams(params, i18n);
        if (validateGetServiceParams.status !== HttpStatus.OK) return validateGetServiceParams;

        const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE
            ? Number(params.limit)
            : Constants.SQL_DEFAULT_LIMIT_VALUE;
        const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

        let filterParams: any = { limit, offset };
        filterParams = params.serviceId ? { ...filterParams, serviceId: Number(params.serviceId) } : filterParams;
        filterParams = params.createdBy ? { ...filterParams, createdBy: Number(params.createdBy) } : filterParams;

        const serviceHistories = await this.alertConfigurationRepository.retrieveAllAlertConfigurationHistories(filterParams);

        return Response.withData(HttpStatus.OK, i18n.t('alert-configuration.alertConfigurationHistoriesRetrievedSuccessfully'), serviceHistories);
    } catch (error) {
        const errorMessage = `An error occurred in findAlertConfigurationHistories: ${JSON.stringify(params)} ==> ${error}`;

        // * Notify devs about the error
        await SlackCloudNotificationAlert.send({ message: errorMessage });

        logger.error(errorMessage);
        return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
}

  async updateAlertConfiguration(alertConfigurationId: number, dto: UpdateAlertConfigurationDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
    try {
      const validateUpdateAlert = await this.alertConfigurationValidator.validateUpdateAlertConfigurationDto(alertConfigurationId, dto, i18n);
      if (validateUpdateAlert.status !== HttpStatus.OK) return validateUpdateAlert;

      let { alertConfiguration, service } = validateUpdateAlert.data;
      alertConfiguration = await this.alertConfigurationRepository.updateAlertConfigurationAndHistory(alertConfigurationId,
        {
          reason: dto.reason,
          updatedBy: bearerTokenUser.id,
          serviceId: service ? service.id : alertConfiguration.serviceId ?? undefined,
          sendSlackAlert: dto.sendSlackAlert ? Utils.stringToBoolean(`${dto.sendSlackAlert}`) : alertConfiguration.sendSlackAlert,
          sendEmail: dto.sendEmail ? Utils.stringToBoolean(`${dto.sendEmail}`) : alertConfiguration.sendEmail ?? undefined,
          emailAddressRecipients: dto.emailAddressRecipients ? JSON.stringify(dto.emailAddressRecipients) : alertConfiguration.emailAddressRecipients ?? undefined,
        },
      );

      return Response.withData(HttpStatus.OK, i18n.t('alert-configuration.alertConfigurationUpdatedSuccessfully'), alertConfiguration);
    } catch (error) {
      const errorMessage = `An error occurred in updateAlertConfiguration: ${JSON.stringify(dto)} ==> ${error}`;

      // * Notify devs about the error
      await SlackCloudNotificationAlert.send({ message: errorMessage });

      logger.error(errorMessage);
      return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
    }
  }
}
