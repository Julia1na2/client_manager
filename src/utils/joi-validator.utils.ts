import { JoiPayloadType } from './../commons/types/type';
import { Response, ResponseWithoutData } from './../commons/responses/response';
import { HttpStatus } from '@nestjs/common';
import logger from './logger';
import { config } from '../config/config';

export class JoiValidator {
  static validate(payload: JoiPayloadType): Promise<ResponseWithoutData | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const { error } = payload.joiSchema.validate(payload.data, config.joiOptions);

        return resolve(error
          ? Response.withoutData(
            HttpStatus.BAD_REQUEST,
            error.details[0].message
          )
          : null
        );
      } catch (error) {
        logger.error(`Error occurred while running joi validator: ${error}`);
        return reject(`Error occurred while running joi validator: ${error}`);
      }
    });
  }
}
