import { HttpStatus, Injectable } from "@nestjs/common";
import { ServiceRepository } from "./../../repositories/service.repository";
import { GetServiceHistoriesParams, GetServiceParams, UpdateServiceDto, createServiceDto } from "./dtos/service.dto";
import { ResponseWithoutData, Response, ResponseWithData } from "../../commons/responses/response";
import * as Joi from "joi";
import { JoiValidator } from "../../utils/joi-validator.utils";
import { I18n, I18nContext } from "nestjs-i18n";

@Injectable()
export class ServiceValidator {
    constructor(private readonly serviceRepository: ServiceRepository) { }

    async validateCreateServiceDto(dto: createServiceDto, @I18n() i18n: I18nContext): Promise<ResponseWithoutData> {
        return new Promise(async (resolve, reject) => {
            try {
                
                const joiSchema: Joi.ObjectSchema<createServiceDto> = Joi.object({
                    friendlyName: Joi.string().trim().required().label('The friendly name'),
                    description: Joi.string().strip().required().label('The description'),
                    maxClientCount: Joi.number().integer().positive().optional().label('The maximum number of client for this service')
                });

                const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
                if (validateResults) return resolve(validateResults);

                let existingService = await this.serviceRepository.retrieveService({ friendlyName: dto.friendlyName });
                if (existingService) {
                    return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('service.serviceWithFriendlyNameAlreadyExists')));
                }

                return resolve(Response.withoutData(HttpStatus.OK, 'OK'));
            } catch (error) {
                return reject(
                    `An error occured during param validation: ${JSON.stringify(dto)}`
                );
            }
        });
    }

    async validateGetServicesParams(params: GetServiceParams, @I18n() i18n: I18nContext): Promise<ResponseWithoutData> {
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema: Joi.ObjectSchema<GetServiceParams> = Joi.object({
                    code: Joi.string().trim().strip().optional().label('The code'),
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

    async validateGetServiceParams(serviceId: number, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema = Joi.object({
                    serviceId: Joi.number().positive().integer().min(1).required().label('The service Id'),
                });

                const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: { serviceId } });
                if (validateResults) return resolve(validateResults);

                const service = await this.serviceRepository.retrieveService({ id: Number(serviceId) });
                if (!service) {
                    return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('service.serviceNotFound')));
                }

                return resolve(Response.withData(HttpStatus.OK, 'OK', { service }));
            } catch (error) {
                return reject(`An error occured during param validation: ${serviceId}`);
            }
        });
    }

    async validateGetServiceHistoriesParams(params: GetServiceHistoriesParams, @I18n() i18n: I18nContext): Promise<ResponseWithoutData> {
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema: Joi.ObjectSchema<GetServiceHistoriesParams> = Joi.object({
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

    async validateUpdateServiceParams(serviceId: number, dto: UpdateServiceDto, @I18n() i18n: I18nContext): Promise<ResponseWithData> {
        return new Promise(async (resolve, reject) => {
            try {                
                const joiSchema: Joi.ObjectSchema<UpdateServiceDto> = Joi.object({
                    reason: Joi.string().trim().strip().required().label('Reason for the update'),
                    friendlyName: Joi.string().trim().strip().optional().label('The friendly name'),
                    description: Joi.string().trim().strip().optional().label('The description'),
                    maxClientCount: Joi.number().integer().positive().optional().label('The maximum number of client for this service')
                });

                const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: dto });
                if (validateResults) return resolve(validateResults);

                const service = await this.serviceRepository.retrieveService({ id: Number(serviceId) });
                if (!service) {
                    return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('service.serviceNotFound')));
                }

                let existingService;
                if (dto.friendlyName) {
                    existingService = await this.serviceRepository.retrieveService({ friendlyName: dto.friendlyName });
                    if (existingService && service.id !== existingService.id) {
                        return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('service.serviceWithFriendlyNameAlreadyExists')));
                    }
                }

                return resolve(Response.withData(HttpStatus.OK, 'OK', { service }));
            } catch (error) {
                return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
            }
        });
    }

}
