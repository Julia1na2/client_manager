import { HttpStatus, Injectable } from "@nestjs/common";
import { ServiceRepository } from "../../repositories/service.repository";
import { ServiceValidator } from "./service.validator";
import { GetServiceHistoriesParams, GetServiceParams, UpdateServiceDto, createServiceDto } from "./dtos/service.dto";
import { ResponseWithData, Response } from "../../commons/responses/response";
import { Constants } from "../../commons/enums/constants.enum";
import logger from "../../utils/logger";
import { Service } from "./entities/service.entity";
import { SlackCloudNotificationAlert } from "../../helpers/slack.notification";
import { I18n, I18nContext } from "nestjs-i18n";
import { Utils } from "../../utils/utils";
import { Customer } from "../customer/entities/customer.entity";

@Injectable()
export class Services {
    constructor(
        private readonly serviceValidator: ServiceValidator,
        private readonly serviceRepository: ServiceRepository,
    ) { }

    async createService(dto: createServiceDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
        try {
            const validateService = await this.serviceValidator.validateCreateServiceDto(dto, i18n)
            if (validateService.status !== HttpStatus.OK) return validateService;
            
            const service = await this.serviceRepository.saveServiceAndHistory({
                code: Utils.generateUniqueObjectId('service'),
                friendlyName: dto.friendlyName,
                description: dto.description,
                createdBy: bearerTokenUser.id,
                maxClientCount: dto.maxClientCount,
            });

            return Response.withData(HttpStatus.CREATED, i18n.t(`service.serviceCreatedSuccessfully`), service);
        } catch (error) {
            const errorMessage = `An error occurred in createService: ${JSON.stringify(dto)} ==> ${error}`;

            // * Notify devs about the error
            await SlackCloudNotificationAlert.send({ message: errorMessage });

            logger.error(errorMessage);
            return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
        }
    }

    async findServices(params: GetServiceParams, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
        try {
            const validateGetServiceParams = await this.serviceValidator.validateGetServicesParams(params, i18n);
            if (validateGetServiceParams.status !== HttpStatus.OK) return validateGetServiceParams;

            const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE
                ? Number(params.limit)
                : Constants.SQL_DEFAULT_LIMIT_VALUE;
            const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

            let filterParams: any = { limit, offset };
            filterParams = params.code ? { ...filterParams, code: params.code } : filterParams;

            const services = await this.serviceRepository.retrieveServices(filterParams);

            return Response.withData(HttpStatus.OK, i18n.t('service.servicesRetrievedSuccessfully'), services);
        } catch (error) {
            const errorMessage = `An error occurred in findServices: ${JSON.stringify(params)} ==> ${error}`;

            // * Notify devs about the error
            await SlackCloudNotificationAlert.send({ message: errorMessage });

            logger.error(errorMessage);
            return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
        }

    }

    async findService(serviceId: number, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<any> {
        try {
            const validateResult = await this.serviceValidator.validateGetServiceParams(serviceId, i18n);
            if (validateResult.status !== HttpStatus.OK) return validateResult;

            const service = validateResult.data.service as Service;

            return Response.withData(HttpStatus.OK, i18n.t('service.serviceRetrievedSuccessfully'), service)
        } catch (error) {
            const errorMessage = `An error occurred in findService: ${serviceId} ==> ${error}`;

            // * Notify devs about the error
            await SlackCloudNotificationAlert.send({ message: errorMessage });

            logger.error(errorMessage);
            return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
        }
    }

    async findServiceHistories(params: GetServiceHistoriesParams, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
        try {
            const validateGetServiceParams = await this.serviceValidator.validateGetServiceHistoriesParams(params, i18n);
            if (validateGetServiceParams.status !== HttpStatus.OK) return validateGetServiceParams;

            const limit = params.limit && Number(params.limit) <= Constants.SQL_DEFAULT_LIMIT_VALUE
                ? Number(params.limit)
                : Constants.SQL_DEFAULT_LIMIT_VALUE;
            const offset = params.offset ? Number(params.offset) : Constants.SQL_DEFAULT_OFFSET_VALUE;

            let filterParams: any = { limit, offset };
            filterParams = params.serviceId ? { ...filterParams, serviceId: Number(params.serviceId) } : filterParams;
            filterParams = params.createdBy ? { ...filterParams, createdBy: Number(params.createdBy) } : filterParams;

            const serviceHistories = await this.serviceRepository.retrieveAllServiceHistories(filterParams);

            return Response.withData(HttpStatus.OK, i18n.t('service.serviceHistoriesRetrievedSuccessfully'), serviceHistories);
        } catch (error) {
            const errorMessage = `An error occurred in findServiceHistories: ${JSON.stringify(params)} ==> ${error}`;

            // * Notify devs about the error
            await SlackCloudNotificationAlert.send({ message: errorMessage });

            logger.error(errorMessage);
            return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
        }
    }

    async updateService(serviceId: number, dto: UpdateServiceDto, @I18n() i18n: I18nContext, bearerTokenUser: Customer): Promise<ResponseWithData> {
        try {
            const validateUpdates = await this.serviceValidator.validateUpdateServiceParams(serviceId, dto, i18n);
            if (validateUpdates.status !== HttpStatus.OK) return validateUpdates;

            let service = validateUpdates.data.service as Service;
            service = await this.serviceRepository.updateServiceAndHistory(service.id, {
                reason: dto.reason,
                updatedBy: bearerTokenUser.id,
                description: dto.description ? dto.description : service.description,
                friendlyName: dto.friendlyName ? dto.friendlyName : service.friendlyName,
                maxClientCount: dto.maxClientCount ? dto.maxClientCount : service.maxClientCount,
            });

            return Response.withData(HttpStatus.OK, i18n.t('service.serviceUpdatedSuccessfully'), service);
        } catch (error) {
            const errorMessage = `An error occurred in updateService: ${JSON.stringify(dto)} ==> ${error}`;

            // * Notify devs about the error
            await SlackCloudNotificationAlert.send({ message: errorMessage });

            logger.error(errorMessage);
            return Response.withoutData(HttpStatus.INTERNAL_SERVER_ERROR, i18n.t('server.serverError'));
        }
    }
}
