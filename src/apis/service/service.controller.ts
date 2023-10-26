import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Services } from "./service";
import { GetServiceHistoriesParams, GetServiceParams, UpdateServiceDto, createServiceDto } from "./dtos/service.dto";
import { Response } from "express";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetServiceResponse, GetServicesResponse } from "./entities/service.entity";
import { ResponseWithoutData } from "../../commons/responses/response";
import { Constants } from "../../commons/enums/constants.enum";
import { I18n, I18nContext } from "nestjs-i18n";
import { Customer } from "../customer/entities/customer.entity";

@ApiTags('services')
@Controller('api/v1/services')
export class ServiceController {
    constructor(private readonly serviceService: Services) { }

    @Post()
    @ApiOperation({ summary: 'Used to create services' })
    @ApiCreatedResponse({ description: 'Service created successfully', type: GetServiceResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async createService(@Body() requestBody: createServiceDto, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
        const bearerTokenUser: Customer = req.customer;
        const { status, ...responseData } = await this.serviceService.createService(requestBody, i18n, bearerTokenUser);
        return res.status(status).json(responseData);
    }

    @Get()
    @ApiOperation({ summary: 'Used in getting services' })
    @ApiOkResponse({ description: 'Services successfully retrieved', type: GetServicesResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async getServices(@Query() queryParams: GetServiceParams, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
        const bearerTokenUser: Customer = req.customer;
        const { status, ...responseData } = await this.serviceService.findServices(queryParams, i18n, bearerTokenUser);
        return res.status(status).json(responseData);
    }

    @Get('history')
    @ApiOperation({ summary: 'Used in getting services' })
    @ApiOkResponse({ description: 'Service histories retrieved successfully', type: GetServicesResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async getServicehistories(@Query() queryParams: GetServiceHistoriesParams, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
        const bearerTokenUser: Customer = req.customer;
        const { status, ...responseData } = await this.serviceService.findServiceHistories(queryParams, i18n, bearerTokenUser);
        return res.status(status).json(responseData);
    }

    @Get(':serviceId')
    @ApiOperation({ description: 'Used in getting a service by the reference' })
    @ApiOkResponse({ description: 'Service retrieved successfully', type: GetServiceResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async getService(@Param('serviceId') serviceId: number, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
        const bearerTokenUser: Customer = req.customer;
        const { status, ...responseData } = await this.serviceService.findService(serviceId, i18n, bearerTokenUser);
        return res.status(status).json(responseData);
    }

    @Put(':serviceId')
    @ApiOperation({ summary: 'Used to update a service' })
    @ApiOkResponse({ description: 'Service update successful', type: GetServiceResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async updateService(@Param('serviceId') serviceId: number, @Body() requestBody: UpdateServiceDto, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
        const bearerTokenUser: Customer = req.customer;
        const { status, ...responseData } = await this.serviceService.updateService(Number(serviceId), requestBody, i18n, bearerTokenUser);
        return res.status(status).json(responseData);
    }
}
