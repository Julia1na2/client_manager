import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import logger from '../../utils/logger';
import { ClientRepository } from '../../repositories/client.repository';
const requestIp = require('request-ip');
const bcrypt = require('bcrypt');

@Injectable()
export class IsClientMiddleware implements NestMiddleware {
    constructor(private readonly clientRepository: ClientRepository) {}

    async use(req: any, res: Response, next: NextFunction) {
        let clientIp = requestIp.getClientIp(req);
        try {
            clientIp = req.headers['x-forwarded-for'].split(',')[0];
        } catch (error) {}

        logger.info(`Incoming request IP: ${clientIp}`);

        // * checking if the request came with a client key
        if (!req.headers['client-id']) {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                message: 'No client ID was submitted',
            });
        }

        // checking if the request came with a client secret
        if (!req.headers['client-secret']) {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                message: 'No client secret was submitted',
            });
        }

        // if the request came with a key and secret, check if they are correct
        const clientId = <string>req.headers['client-id'];
        const clientSecret = <string>req.headers['client-secret'];
        const existingClient = await this.clientRepository.retrieveClient({ publicId: clientId });

        // check if client key is correct
        if (!existingClient) {
            logger.warn(`Api client is not found with the given clientId: ${clientId}`);
            return res.status(HttpStatus.UNAUTHORIZED).send({
                message: 'Client key is invalid',
            });
        }

        logger.info(`Api client details --> clientId: ${clientId} | clientScope: ${existingClient.scope}`);

        if (existingClient.shouldExpire && existingClient.expiresAt && new Date() > new Date(existingClient.expiresAt)) {
            logger.warn(`Api client has expired clientId: ${clientId}`);
            return res.status(HttpStatus.UNAUTHORIZED).send({
                message: 'Client credentials are expired',
            });
        }

        // checking to make sure the client secret submitted is valid
        const response = await bcrypt.compare(
            clientSecret,
            existingClient.secretKey!,
        );
        if (!response) {
            return res.status(HttpStatus.UNAUTHORIZED).send({
                message: 'Client secret is invalid',
            });
        }

        // success
        req.apiClient = existingClient;
        req.clientIp = clientIp;

        next();
    };
}
