import { Utils } from './../../utils/utils';
import {HttpStatus,Injectable,NestMiddleware,Req,Res} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Response as APIResponse } from '../responses/response';
import logger from '../../utils/logger';
import { Constants } from '../enums/constants.enum';
import { config } from '../../config/config';

@Injectable()
export class ChangeLanguageMiddleware implements NestMiddleware {
  constructor() {}

  async use(@Req() req: any, @Res() res: Response, next: NextFunction) {
    try {
      // Validate request header
      if (!req.headers['lang'] && !req.headers['Accept-Language'] && !req.headers['language']) {
        logger.warn('No settings found for customer default language');

        if (!req.customer) {
          req.headers['Accept-Language'] = config.appDefaultLanguage;
        } else {
          const language = Utils.getSupportedLanguage(req.customer.language);
          req.headers['Accept-Language'] = language || config.appDefaultLanguage;

          logger.info(`Done setting customer default language to ${language}`);
        }
      }

      next();
    } catch (error) {
      logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(APIResponse.withoutData(HttpStatus.INTERNAL_SERVER_ERROR,Constants.SERVER_ERROR),
        );
    }
  }
}
