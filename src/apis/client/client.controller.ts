import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { Response } from 'express';
import { GetClientResponse, GetClientsResponse } from './entities/client.entity';
import { ResponseWithoutData } from '../../commons/responses/response';
import { Constants } from '../../commons/enums/constants.enum';
import { GetClientHistoriesParams, GetClientParams, UpdateClientDto, createClientDto } from './dtos/client.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Customer } from '../customer/entities/customer.entity';

@ApiTags('client')
@Controller('api/v1/clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Used to create clients' })
  @ApiCreatedResponse({description: 'Client created successfully',type: GetClientResponse})
  @ApiBadRequestResponse({description: 'Bad Request: Validation error',type: ResponseWithoutData})
  @ApiInternalServerErrorResponse({description: Constants.SERVER_ERROR,type: ResponseWithoutData})
  async createClient(@Body() requestBody: createClientDto,@Res() res: Response,@I18n() i18n: I18nContext,@Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.clientService.createClient(requestBody,i18n,bearerTokenUser);
    return res.status(status).json(responseData);
  }

  @Get()
  @ApiOperation({ summary: 'Used in getting clients' })
  @ApiOkResponse({description: 'Clients successfully retrieved',type: GetClientsResponse})
  async getClients(@Query() queryParams: GetClientParams,@Res() res: Response,@I18n() i18n: I18nContext,@Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.clientService.findClients(queryParams,i18n,bearerTokenUser);
    return res.status(status).json(responseData);
  }

  @Get('history')
    @ApiOperation({ summary: 'Used in getting client history' })
    @ApiOkResponse({ description: 'Client history retrieved successfully', type: GetClientsResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
    @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
    async getServicehistories(@Query() queryParams: GetClientHistoriesParams, @Res() res: Response, @I18n() i18n: I18nContext, @Req() req: any) {
      const bearerTokenUser: Customer = req.customer;
      const { status, ...responseData } = await this.clientService.findClientHistories(queryParams, i18n, bearerTokenUser);
      return res.status(status).json(responseData);
    }

  @Get(':clientId')
  @ApiOperation({ description: 'Used in getting a client by the reference' })
  @ApiOkResponse({description: 'Client successfully retrieved',type: GetClientResponse})
  @ApiInternalServerErrorResponse({description: Constants.SERVER_ERROR, type: ResponseWithoutData})
  async getClient(@Param('clientId') clientId: number,@Res() res: Response,@I18n() i18n: I18nContext,@Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.clientService.findClient(clientId,i18n,bearerTokenUser);
    return res.status(status).json(responseData);
  }

  @Put(':clientId')
  @ApiOperation({ summary: 'Used to update a client' })
  @ApiOkResponse({description: 'Client update successful',type: GetClientResponse})
  @ApiInternalServerErrorResponse({description: Constants.SERVER_ERROR,type: ResponseWithoutData})
  async updateClient(@Param('clientId') clientId: number,@Body() requestBody: UpdateClientDto,@Res() res: Response,@I18n() i18n: I18nContext,@Req() req: any) {
    const bearerTokenUser: Customer = req.customer;
    const { status, ...responseData } = await this.clientService.updateClient(clientId,requestBody,i18n,bearerTokenUser);
    return res.status(status).json(responseData);
  }
}
