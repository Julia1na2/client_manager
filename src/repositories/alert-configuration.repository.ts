import { Injectable } from '@nestjs/common';
import { IAlertConfigurationRepository } from './interfaces/alert-configuration.interface';
import {SaveAlertConfigurationParams,AlertConfigurationFilterParams,AlertConfigurationFilterParamsWithLimits,UpdateAlertConfigurationParams} from './entities/alert-configuration.entity';
import prisma from '../commons/prisma';
import { AlertConfiguration } from '../apis/alert-configuration/entities/alert-configuration.entity';
import { SQLQueryListResponse } from "../commons/types/type";
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class AlertConfigurationRepository implements IAlertConfigurationRepository {
  saveAlertConfigurationAndHistory(params: SaveAlertConfigurationParams): Promise<AlertConfiguration> {
    return new Promise(async (resolve, reject) => {
      try {
        const alertConfiguration = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
          const alertConfiguration = await prismaInstance.alertConfiguration.create({ data: params });
          await prismaInstance.alertConfigurationHistory.create({
            data: {
              startDate: new Date(),
              data: JSON.stringify(alertConfiguration),
              createdBy: alertConfiguration.createdBy,
              alertConfigurationId: alertConfiguration.id,
              reason: 'New alert configuration created',
            }
          });

          return alertConfiguration;
        })
        
        return resolve(alertConfiguration);
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveAlertConfiguration(params: AlertConfigurationFilterParams): Promise<AlertConfiguration | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const alertConfiguration = await prisma.alertConfiguration.findFirst({
          where: params,
        });
        return resolve(alertConfiguration);
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveAlertConfigurations(params: AlertConfigurationFilterParamsWithLimits): Promise<SQLQueryListResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const { offset, limit, ...queryParams } = params;
        const alertConfigurationsTotalCount = await prisma.alertConfiguration.count({ where: queryParams });
        const alertConfigurations = await prisma.alertConfiguration.findMany({
          where: queryParams,
          take: limit,
          skip: offset,
        });
        return resolve({
          data: alertConfigurations,
          count: alertConfigurations.length,
          totalCount: alertConfigurationsTotalCount,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveAllAlertConfigurationHistories(filters: AlertConfigurationFilterParamsWithLimits): Promise<SQLQueryListResponse> {
      return new Promise(async (resolve, reject) => {
          try {
              const { limit, offset, ...filterParams } = filters;
              let query = Prisma.sql`SELECT ACH.id AS "alertConfigurationHistoryId", ACH.alert_configuration_id AS "alertConfigurationId", C1.username AS "createdBy", 
                                      C2.username AS "updatedBy", ACH."data", ACH.start_date AS "startDate", ACH.end_date AS "endDate", 
                                      ACH.created_at AS "createdAt", ACH.updated_at AS "updatedAt" 
                              FROM alert_configuration_history ACH 
                              INNER JOIN customer C1 ON ACH.created_by = C1.id 
                              LEFT JOIN customer C2 ON ACH.updated_by = C2.id 
                              LEFT JOIN alert_configuration AC ON ACH.alert_configuration_id = AC.id
                              WHERE (AC.service_id = ${filterParams.serviceId}::int OR ${filterParams.serviceId}::text IS NULL) 
                                      AND (ACH.alert_configuration_id = ${filterParams.id}::int OR ${filterParams.id}::text IS NULL) 
                                      AND (ACH.created_by = ${filterParams.createdBy}::int OR ${filterParams.createdBy}::text IS NULL) 
                              ORDER BY ACH.created_at DESC`;
              const allRecords: any[] = await prisma.$queryRaw(query);
              const serviceHistory: any[] = await prisma.$queryRaw(Prisma.sql`${query} LIMIT ${limit} OFFSET ${offset}`);

              // success
              return resolve({
                  data: serviceHistory,
                  count: serviceHistory.length,
                  totalCount: allRecords.length,
              });
          } catch (error) {
              return reject(error);
          }
      });
  }

  updateAlertConfigurationAndHistory(alertConfigurationId: number, params: UpdateAlertConfigurationParams): Promise<AlertConfiguration> {
    return new Promise(async (resolve, reject) => {
      try {
        const alertConfiguration = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
          const existingHistory = await prismaInstance.alertConfigurationHistory.findFirst({
            where: { alertConfigurationId, endDate: null }
          });
          if (existingHistory) {
            await prismaInstance.alertConfigurationHistory.update({
              where: { id: existingHistory.id },
              data: { endDate: new Date(), updatedBy: params.updatedBy }
            });
          }

          const { reason, updatedBy, ...updateAlertConfigurationParams } = params;
          const alertConfiguration = await prismaInstance.alertConfiguration.update({
            where: { id: alertConfigurationId },
            data: updateAlertConfigurationParams,
          });

          await prismaInstance.alertConfigurationHistory.create({
            data: {
              reason,
              startDate: new Date(),
              data: JSON.stringify(alertConfiguration),
              createdBy: alertConfiguration.createdBy,
              alertConfigurationId: alertConfiguration.id,
            }
          });

          return alertConfiguration;
        })

        return resolve(alertConfiguration);
      } catch (error) {
        return reject(error);
      }
    });
  }

  resetAlertConfiguration() {
    return new Promise(async (resolve, reject) => {
      try {
        await prisma.clientHistory.deleteMany({});
        await prisma.client.deleteMany({});
        await prisma.alertConfigurationHistory.deleteMany({});
        await prisma.alertConfiguration.deleteMany({});
        return resolve('OK');
      } catch (error) {
        return reject(error);
      }
    });
  }
}
