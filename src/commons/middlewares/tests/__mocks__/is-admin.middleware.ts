import { Customer } from './../../../../apis/customer/entities/customer.entity';
import { HttpStatus, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Response as APIResponse } from '../../../responses/response';
import logger from '../../../../utils/logger';
import { Constants } from '../../../enums/constants.enum';
import { CustomBoostrap } from '../../../../config/boostrap.config';

export class IsAdminMiddlewareMock implements NestMiddleware {
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

      // Get Default test user
      const testUser: Customer = await CustomBoostrap.customer();

      // Successful
      // Add customer to request context
      req.customer = testUser;
      next();
    } catch (error) {
      logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.withoutData(
            HttpStatus.INTERNAL_SERVER_ERROR,
            Constants.SERVER_ERROR,
          ),
        );
    }
  }
}
