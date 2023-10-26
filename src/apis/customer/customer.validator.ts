import { HttpStatus, Injectable } from "@nestjs/common";
import { GetCustomersParams, UpdateCustomerDto } from "./dtos/customer.dto";
import { ResponseWithoutData, Response, ResponseWithData } from "../../commons/responses/response";
import { JoiValidator } from "../../utils/joi-validator.utils";
import * as Joi from 'joi';
import { CustomerRepository } from "../../repositories/customer.repository";
import { I18n, I18nContext } from "nestjs-i18n";

@Injectable()
export class CustomerValidator { 
    constructor(private readonly customerRepository: CustomerRepository) { }

    async validateGetCustomersParams(params: GetCustomersParams, @I18n() i18n: I18nContext): Promise<ResponseWithoutData>{
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema: Joi.ObjectSchema<GetCustomersParams> = Joi.object({
                    username: Joi.string().trim().strip().optional().label('The username'),
                    nellysCoinUserId: Joi.number().positive().integer().optional().label('The nellys coin user ID'),
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

    async validateGetCustomerParams(customerId: number,  @I18n() i18n: I18nContext): Promise<ResponseWithData>{
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema = await Joi.object({
                    customerId: Joi.number().positive().integer().min(1).required().label("The customer's Id")
                });

                const validateResults = await JoiValidator.validate({ joiSchema: joiSchema, data: { customerId }});
                if (validateResults) return resolve(validateResults);

                const customer = await this.customerRepository.retrieveCustomer({ id: Number(customerId) });
                if (!customer) {
                    return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('customer.customerNotFound')));
                }

                return resolve(Response.withData(HttpStatus.OK, "Ok", {customer}))
            } catch (error) {
                return reject(`An error occured during param validation: ${customerId} `)
            }
        })
    }

    async validateUpdateCustomerDto(nellysCoinUserId: number, dto: UpdateCustomerDto,  @I18n() i18n: I18nContext): Promise<ResponseWithData> {
        return new Promise(async (resolve, reject) => {
            try {
                const joiSchema: Joi.ObjectSchema<UpdateCustomerDto> = Joi.object({
                    oldUsername: Joi.string().trim().strip().required().label('The old username'),
                    newUsername: Joi.string().trim().strip().required().label('The new username'),
                    emailAddress: Joi.string().trim().strip().optional().label('The email address'),
                    status: Joi.string().trim().strip().optional().label('The status of the customer'),
                    type: Joi.string().trim().strip().optional().label('The customer type')
                });

                const validateUpdate = await JoiValidator.validate({ joiSchema, data: dto });
                if (validateUpdate) return resolve(validateUpdate)

                const customer = await this.customerRepository.retrieveCustomer({ nellysCoinUserId: Number(nellysCoinUserId) });
                if (!customer) {
                    return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('customer.customerNotFound')));
                }

                let existingCustomer = await this.customerRepository.retrieveCustomer({ username: dto.oldUsername });
                if (!existingCustomer) {
                    return resolve(Response.withoutData(HttpStatus.NOT_FOUND, i18n.t('customer.customerNotFound')));
                } else if (existingCustomer && existingCustomer.id !== customer.id) {
                    return resolve(Response.withoutData(HttpStatus.UNAUTHORIZED, i18n.t('server.unauthorizedAction')));
                }
                
                if (dto.newUsername) {
                    existingCustomer = await this.customerRepository.retrieveCustomer({ username: dto.newUsername });
                    if (existingCustomer && customer.id !== existingCustomer.id) {
                        return resolve(Response.withoutData(HttpStatus.BAD_REQUEST, i18n.t('customer.customerWithUsernameAlreadyExists')))
                    }
                }

                return resolve(Response.withData(HttpStatus.OK, 'OK', { customer }));
            } catch (error) {
                return reject(`An error occured during param validation: ${JSON.stringify(dto)}`);
            }
        })
    }
}
