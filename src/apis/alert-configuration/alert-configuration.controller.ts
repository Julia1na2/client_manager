import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { AlertConfigurationService } from './alert-configuration.service';
import { Response } from 'express';
import { CreateAlertConfigurationDto, GetAlertConfigurationHistoryParams, GetAlertConfigurationParams, UpdateAlertConfigurationDto } from './dtos/alert-configuration.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAlertConfigurationResponse, GetAlertConfigurationsResponse } from './entities/alert-configuration.entity';
import { ResponseWithoutData } from '../../commons/responses/response';
import { Constants } from '../../commons/enums/constants.enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Customer } from '../customer/entities/customer.entity';

@ApiTags('alert-configurations')
@Controller('api/v1/alert-configurations')
export class AlertConfigurationController {
  constructor(private readonly alertConfigurationServices: AlertConfigurationService) {}

  @Post()
  @ApiOperation({ summary: 'Used to create Alerts' })
  @ApiCreatedResponse({ description: 'Alert configuration created successfully', type: GetAlertConfigurationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error',type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async createAlertConfiguration(@Body() requestBody: CreateAlertConfigurationDto, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.alertConfigurationServices.createAlertConfiguration(requestBody, i18n, bearerTokenUser);
    return res.status(status).json(responseData);
  }

  @Get()
  @ApiOperation({ summary: 'Used in getting alerts' })
  @ApiOkResponse({ description: 'Alerts successfully retrieved', type: GetAlertConfigurationsResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async getAlertConfiguration(@Query() queryParams: GetAlertConfigurationParams, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.alertConfigurationServices.findAlertConfigurations(queryParams, i18n, bearerTokenUser);
    return res.status(status).json(responseData);
  }

  @Get('history')
  @ApiOperation({ summary: 'Used in getting alert configurations' })
  @ApiOkResponse({ description: 'Alert configuration retrieved successfully', type: GetAlertConfigurationsResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async getAlertConfigurationhistories(@Query() queryParams: GetAlertConfigurationHistoryParams, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
      const bearerTokenUser: Customer = req.customer;
      const { status, ...responseData } = await this.alertConfigurationServices.findAlertConfigurationHistories(queryParams, i18n, bearerTokenUser);
      return res.status(status).json(responseData);
  }

  @Put(':alertConfigurationId')
  @ApiOperation({ summary: 'Used to update a alert' })
  @ApiOkResponse({description: 'Alert update successful',type: GetAlertConfigurationResponse})
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async updateAlertConfiguration(@Param('alertConfigurationId') alertConfigurationId: number, @Body() requestBody: UpdateAlertConfigurationDto, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.alertConfigurationServices.updateAlertConfiguration(Number(alertConfigurationId), requestBody, i18n, bearerTokenUser);
    return res.status(status).json(responseData);
  }
}
