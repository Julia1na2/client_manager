import { Injectable } from '@nestjs/common';
import { IClientRepository } from './interfaces/client.interface';
import { ClientFilterParams, ClientFilterParamsWithLimits, SaveClientParams, UpdateClientParams } from './entities/client.entity';
import { Client } from '../apis/client/entities/client.entity';
import prisma from '../commons/prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import { SQLQueryListResponse } from '../commons/types/type';

@Injectable()
export class ClientRepository implements IClientRepository {
  saveClientAndHistory(params: SaveClientParams): Promise<Client> {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
          const client = await prismaInstance.client.create({ data: params });
          await prismaInstance.clientHistory.create({
            data: {
              clientId: client.id,
              createdBy: client.createdBy,
              data: JSON.stringify(client),
              startDate: new Date(),
              reason: 'New client created',
            },
          });
          return client;

        });
        return resolve(client);
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveClient(params: ClientFilterParams): Promise<Client | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await prisma.client.findFirst({ where: params });
        return resolve(client);
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveClients(params: ClientFilterParamsWithLimits): Promise<SQLQueryListResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const { offset, limit, ...queryParams } = params;
        const clientsTotalCount = await prisma.client.count({ where: queryParams });
        const clients = await prisma.client.findMany({
          where: queryParams,
          take: limit,
          skip: offset,
        });

        return resolve({
          data: clients,
          count: clients.length,
          totalCount: clientsTotalCount,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  retrieveAllClientHistories(filters: ClientFilterParamsWithLimits): Promise<SQLQueryListResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const { limit, offset, ...filterParams } = filters;
        let query = Prisma.sql`SELECT CH.id AS "clientHistoryId", CH.client_id AS "clientId", C1.username AS "createdBy", 
                                        C2.username AS "updatedBy", CH."data", CH.start_date AS "startDate", CH.end_date AS "endDate", 
                                        CH.created_at AS "createdAt", CH.updated_at AS "updatedAt" 
                                FROM client_history CH 
                                INNER JOIN customer C1 ON CH.created_by = C1.id 
                                LEFT JOIN customer C2 ON CH.updated_by = C2.id 
                                WHERE (CH.client_id = ${filterParams.clientId}::int OR ${filterParams.clientId}::text IS NULL)
                                ORDER BY CH.created_at DESC`;
        const allRecords: any[] = await prisma.$queryRaw(query);
        const clientHistory: any[] = await prisma.$queryRaw(Prisma.sql`${query} LIMIT ${limit} OFFSET ${offset}`);

        // success
        return resolve({
          data: clientHistory,
          count: clientHistory.length,
          totalCount: allRecords.length,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  updateClientAndHistory(clientId: number, params: UpdateClientParams): Promise<Client> {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
          const existingHistory = await prismaInstance.clientHistory.findFirst({
            where: { clientId, endDate: null },
          });
          if (existingHistory) {
            await prismaInstance.clientHistory.update({
              where: { id: existingHistory.id },
              data: { endDate: new Date(), updatedBy: params.updatedBy },
            });
          }

          const { updatedBy, reason, ...updateClientParams } = params;
          const client = await prismaInstance.client.update({
            where: { id: clientId },
            data: updateClientParams,
          });
          await prismaInstance.clientHistory.create({
            data: {
              reason,
              updatedBy,
              clientId: client.id,
              startDate: new Date(),
              createdBy: client.createdBy,
              data: JSON.stringify(client),
            },
          });

          return client;
        });

        return resolve(client);
      } catch (error) {
        return reject(error);
      }
    });
  }

  resetClient() {
    return new Promise(async (resolve, reject) => {
      try {
        await prisma.clientHistory.deleteMany({});
        await prisma.client.deleteMany({});
        return resolve('OK');
      } catch (error) {
        return reject(error);
      }
    });
  }
}
