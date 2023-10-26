import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import logger from '../../utils/logger';

import { Response } from '../responses/response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    try {
      const context = host.switchToHttp();
      const response = context.getResponse();

      // log error
      if (!(exception instanceof HttpException)) {
        logger.error(exception);
      }

      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      
      logger.error(exception);
      return response
        .status(httpStatus)
        .json(Response.withoutData(httpStatus, exception.message));
    } catch (error) {
      logger.error(error);
    }
  }
}
