import { Service } from '../apis/service/entities/service.entity';
import logger from '../utils/logger';
import { ServiceRepository } from '../repositories/service.repository';
import { SaveServiceParams } from '../repositories/entities/service.entity';
import { AlertConfiguration } from '../apis/alert-configuration/entities/alert-configuration.entity';
import { AlertConfigurationRepository } from '../repositories/alert-configuration.repository';
import { SaveAlertConfigurationParams } from '../repositories/entities/alert-configuration.entity';
import { Client } from '../apis/client/entities/client.entity';
import { ClientRepository } from '../repositories/client.repository';
import { SaveClientParams } from '../repositories/entities/client.entity';
import { ClientScope, ClientStatus } from '../commons/enums/constants.enum';
import { CustomerRepository } from '../repositories/customer.repository';
import { SaveCustomerParams } from '../repositories/entities/customer.entity';
import { Customer } from '../apis/customer/entities/customer.entity';
import { config } from './config';

const bcrypt = require('bcrypt');

export type GeneralTestBoostrapType = {
  isTest?: boolean;
  setup: boolean;
  globalTester?: any;
  seeding?: boolean;
};

export class CustomBoostrap {
  static async service(): Promise<Service> {
    try {
      const serviceRepository = new ServiceRepository();
      const newServiceParam: SaveServiceParams = {
        code: 'service-xxx',
        maxClientCount: 2,
        friendlyName: 'Test',
        description: 'This is a test',
        createdBy: (await CustomBoostrap.customer()).id,
      };

      let service = await serviceRepository.retrieveService({
        code: newServiceParam.code,
      });
      if (service) return service;
      service = await serviceRepository.retrieveService({
        friendlyName: newServiceParam.friendlyName,
      });
      if (service) return service;

      service = await serviceRepository.saveServiceAndHistory(newServiceParam);

      return service;
    } catch (error) {
      logger.error(`An error occurred when boostrapping the service object: ${error}`);
      throw new Error(error);
    }
  }

  static async alertConfig(): Promise<AlertConfiguration> {
    try {
      const alertConfigRepository = new AlertConfigurationRepository();
      const newAlertConfigParam: SaveAlertConfigurationParams = {
        sendSlackAlert: true,
        sendEmail: true,
        serviceId: (await CustomBoostrap.service()).id,
        createdBy: (await CustomBoostrap.customer()).id,
        emailAddressRecipients: JSON.stringify(['juju@gmail.com']),
      };

      let alertConfig = await alertConfigRepository.retrieveAlertConfiguration({
        sendEmail: newAlertConfigParam.sendEmail,
      });
      if (alertConfig) return alertConfig;
      alertConfig = await alertConfigRepository.retrieveAlertConfiguration({
        sendSlackAlert: newAlertConfigParam.sendSlackAlert,
      });
      if (alertConfig) return alertConfig;

      alertConfig =
        await alertConfigRepository.saveAlertConfigurationAndHistory(
          newAlertConfigParam,
        );

      return alertConfig;
    } catch (error) {
      logger.error(`An error occurred when boostrapping the alert object: ${error}`);
      throw new Error(error);
    }
  }

  static async customer(): Promise<Customer> {
    try {
      const customerRepository = new CustomerRepository();
      const newCustomerParam: SaveCustomerParams = {
        username: 'jean',
        nellysCoinUserId: 3,
        language: 'fr',
        emailAddress: 'jean@gmail.com',
        status: 'confirmed',
        type: 'admin',
      };

      let customer = await customerRepository.retrieveCustomer({
        username: newCustomerParam.username,
      });

      if (!customer)
        customer = await customerRepository.retrieveCustomer({
          nellysCoinUserId: newCustomerParam.nellysCoinUserId,
        });
      if (customer) return customer;

      customer = await customerRepository.saveCustomer(newCustomerParam);

      return customer;
    } catch (error) {
      logger.error(
        `An error occurred when boostrapping the customer object: ${error}`,
      );
      throw new Error(error);
    }
  }

  static async client(): Promise<Client> {
    try {
      const clientRepository = new ClientRepository();
      const newClientParam: SaveClientParams = {
        friendlyName: 'Monique',
        scope: ClientScope.WEB,
        serviceId: (await CustomBoostrap.service()).id,
        secretKey: 'happy',
        shouldExpire: false,
        createdBy: (await CustomBoostrap.customer()).id,
        publicId: 'client-xxxx',
        status: ClientStatus.ACTIVE,
        wasRegenerated: false,
      };
      let client = await clientRepository.retrieveClient({
        publicId: newClientParam.publicId,
      });
      if (client) return client; 

      client = await clientRepository.saveClientAndHistory(newClientParam);

      return client;
    } catch (error) {
      logger.error(`An error occurred when boostrapping the client object: ${error}`);
      throw new Error(error);
    }
  }

  static async hashSecret(secret: string): Promise<string> {
    try {
      const hashSecret = await bcrypt.hash(secret, config.bcryptHashRound);
      return hashSecret;
    } catch (error) {
      throw new Error(`An error occured when hashing the secret ${error}`);
    }
  }

  static async run(): Promise<void> {
    try {
      logger.info('Seeding server defaults');

      if (config.nodeEnvironment === 'test') {
        // CREATE DEFAULT TEST USER UNDER TEST ENVIRONMENT.
        await CustomBoostrap.customer();
        await CustomBoostrap.client();
      }

      logger.info('Done seeding server defaults');

      return;
    } catch (error) {
      logger.error(`An error occurred while running custom boostrap: ${error}`);
      return;
    }
  }
}
