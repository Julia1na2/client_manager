import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  Req,
  Res,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Response as APIResponse } from '../responses/response';
import axios from 'axios';
import logger from '../../utils/logger';
import { Constants } from '../enums/constants.enum';
import { NellysCoinAuthUserType } from '../types/type';
import { CustomerRepository } from '../../repositories/customer.repository';
import { config } from '../../config/config';

@Injectable()
export class IsAdminMiddleware implements NestMiddleware {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async use(@Req() req: any, @Res() res: Response, next: NextFunction) {
    try {
      // Validate request header
      if (!req.headers['authorization']) {
        logger.warn('Missing authorization headers');
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send(
            APIResponse.withoutData(
              HttpStatus.UNAUTHORIZED,
              'Missing authorization headers',
            ),
          );
      }

      // Retrieve authentication token
      const authToken: string = req.headers['authorization'];

      // Make request to Nelly's coin to valid token
      const authenticationUrl = `${config.nellysCoinBaseUrlV1}/auth/authenticate-user`;

      try {
        // Create axios request.
        const axiosResponse = await axios.post(authenticationUrl, null, {
          headers: {
            'Authorization': authToken,
            'client-id': config.nellysCoinClientId!,
            'api-key': config.nellysCoinClientSecret!,
          },
        });

        // Retrieve data payload.
        const userPayload: NellysCoinAuthUserType = axiosResponse.data.data;
        // Check if customerType is an admin.
        if (userPayload.customer_type !== 'admin') {
          logger.warn('You must be an administrator to proceed');
          return res.status(HttpStatus.FORBIDDEN)
            .send(APIResponse.withoutData(HttpStatus.FORBIDDEN,'You must be an administrator to proceed',
              ),
            );
        }

        // set request header
        let existingCustomer = await this.customerRepository.retrieveCustomer({ username: userPayload.username });
        if (!existingCustomer) existingCustomer = await this.customerRepository.retrieveCustomer({ nellysCoinUserId: userPayload.customer_id });
        if (!existingCustomer) existingCustomer = await this.customerRepository.retrieveCustomer({ emailAddress: userPayload.email_address });

        if (!existingCustomer) {
          existingCustomer = await this.customerRepository.saveCustomer({
            nellysCoinUserId: userPayload.customer_id,
            username: userPayload.username,
            emailAddress: userPayload.email_address,
            status: userPayload.account_status,
            type: userPayload.customer_type,
            language: userPayload.preferred_language,
          });
        } else {
          await this.customerRepository.updateCustomerById(existingCustomer.id, {
            username: userPayload.username,
            emailAddress: userPayload.email_address,
            status: userPayload.account_status,
            type: userPayload.customer_type,
            language: userPayload.preferred_language,
          });
        }

        // Successful
        // Add customer and bearerToken to request context
        req.customer = existingCustomer;
        req.bearerToken = authToken;
        next();
      } catch (error) {
        logger.warn(error);

        const message = error.response?.statusText;
        const status = error.response?.status;

        return res
          .status(status)
          .send(APIResponse.withoutData(status, message));
      }
    } catch (error) {
      logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(APIResponse.withoutData(HttpStatus.INTERNAL_SERVER_ERROR,Constants.SERVER_ERROR));
    }
  }
}
