import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, Res } from "@nestjs/common";
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CustomerService } from "./customer.service";
import { GetCustomersParams, UpdateCustomerDto } from "./dtos/customer.dto";
import { Response } from "express";
import { GetCustomerResponse, GetCustomersResponse } from "./entities/customer.entity";
import { Constants } from "../../commons/enums/constants.enum";
import { ResponseWithoutData } from "../../commons/responses/response";
import { I18n, I18nContext } from "nestjs-i18n";


@ApiTags('Customers')
@Controller('api/v1/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Used in getting customers' })
  @ApiOkResponse({ description: 'Customers successfully retrieved', type: GetCustomersResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async getCustomers(@Query() queryParams: GetCustomersParams, @Res() res: Response, @I18n() i18n: I18nContext) {
    const { status, ...responseData } = await this.customerService.findCustomers(queryParams, i18n);
    return res.status(status).json(responseData);
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Used in getting a customer by reference' })
  @ApiOkResponse({ description: 'Customer successfully retrieved', type: GetCustomerResponse })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async getCustomer(@Param('customerId', ParseIntPipe) customerId: number, @Res() res: Response, @I18n() i18n: I18nContext) {
    const { status, ...responseData } = await this.customerService.findCustomer(customerId, i18n);
    return res.status(status).json(responseData);
  }

  @Put(':nellysCoinUserId')
  @ApiOperation({ summary: 'Used in updating a customer detail from its nellys coin user ID' })
  @ApiOkResponse({ description: 'Customer update was successful', type: GetCustomerResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async updateCustomerByNellysCoinId(@Param('nellysCoinUserId') nellysCoinUserId: number, @Body() requestBody: UpdateCustomerDto, @Res() res: Response, @I18n() i18n: I18nContext) {
    const { status, ...responseData } = await this.customerService.updateCustomerByNellysCoinId(Number(nellysCoinUserId), requestBody, i18n);
    return res.status(status).json(responseData);
  }

  @Put(':customerId')
  @ApiOperation({ summary: 'Used in updating a customer detail from its ID' })
  @ApiOkResponse({ description: 'Customer update was successful', type: GetCustomerResponse })
  @ApiBadRequestResponse({ description: 'Bad Request: Validation error', type: ResponseWithoutData })
  @ApiInternalServerErrorResponse({ description: Constants.SERVER_ERROR, type: ResponseWithoutData })
  async updateCustomerById(@Param('customerId', ParseIntPipe) customerId: number, @Body() requestBody: UpdateCustomerDto, @Res() res: Response, @I18n() i18n: I18nContext) {
    const { status, ...responseData } = await this.customerService.updateCustomerById(Number(customerId), requestBody, i18n);
    return res.status(status).json(responseData);
  }
}
