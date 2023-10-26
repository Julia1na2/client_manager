import { Injectable } from "@nestjs/common";
import { IServiceRepository } from "./interfaces/service.interface";
import {SaveServiceParams,ServiceFilterParams,ServiceFilterParamsWithLimits,UpdateServiceParams} from "./entities/service.entity";
import prisma from "../commons/prisma";
import { Service } from "../apis/service/entities/service.entity";
import { SQLQueryListResponse } from "../commons/types/type";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class ServiceRepository implements IServiceRepository {
    saveServiceAndHistory(params: SaveServiceParams): Promise<Service> {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
                    const service = await prismaInstance.service.create({ data: params });
                    await prismaInstance.serviceHistory.create({
                        data: {
                            serviceId: service.id,
                            startDate: new Date(),
                            data: JSON.stringify(service),
                            createdBy: service.createdBy,
                            reason: 'New service created',
                        }
                    });

                    return service;
                });

                return resolve(service)
            } catch (error) {
                return reject(error)
            }
        });
    }

    retrieveService(params: ServiceFilterParams): Promise<Service | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await prisma.service.findFirst({
                    where: params,
                });
                return resolve(service);
            } catch (error) {
                return reject(error)
            }
        })
    }

    retrieveServices(params: ServiceFilterParamsWithLimits): Promise<SQLQueryListResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const { offset, limit, ...queryParams } = params;
                const servicesTotalCount = await prisma.service.count({ where: queryParams });
                const services = await prisma.service.findMany({
                    where: queryParams,
                    take: limit,
                    skip: offset,
                });
                return resolve({
                    data: services,
                    count: services.length,
                    totalCount: servicesTotalCount,
                });
            } catch (error) {
                return reject(error);
            }
        })
    }

    retrieveAllServiceHistories(filters: ServiceFilterParamsWithLimits): Promise<SQLQueryListResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const { limit, offset, ...filterParams } = filters;
                let query = Prisma.sql`SELECT SH.id AS "serviceHistoryId", SH.service_id AS "serviceId", C1.username AS "createdBy", 
                                        C2.username AS "updatedBy", SH."data", SH.start_date AS "startDate", SH.end_date AS "endDate", 
                                        SH.created_at AS "createdAt", SH.updated_at AS "updatedAt" 
                                FROM service_history SH 
                                INNER JOIN customer C1 ON SH.created_by = C1.id 
                                LEFT JOIN customer C2 ON SH.updated_by = C2.id 
                                WHERE (SH.service_id = ${filterParams.serviceId}::int OR ${filterParams.serviceId}::text IS NULL) 
                                        AND (SH.created_by = ${filterParams.createdBy}::int OR ${filterParams.createdBy}::text IS NULL) 
                                ORDER BY SH.created_at DESC`;
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

    retrieveTotalActiveClientCount(serviceId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const clientTotalCount = await prisma.client.count({ where: { serviceId } });
                return resolve(clientTotalCount);
            } catch (error) {
                return reject(error);
            }
        });
    }

    updateServiceAndHistory(serviceId: number, params: UpdateServiceParams): Promise<Service> {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await prisma.$transaction(async (prismaInstance: PrismaClient) => {
                    const existingHistory = await prismaInstance.serviceHistory.findFirst({
                        where: { serviceId, endDate: null }
                    });
                    if (existingHistory) {
                        await prismaInstance.serviceHistory.update({
                            where: { id: existingHistory.id },
                            data: { endDate: new Date(), updatedBy: params.updatedBy }
                        });
                    }

                    const { reason, updatedBy, ...updateServiceParams } = params;
                    const service = await prismaInstance.service.update({
                        where: { id: serviceId },
                        data: updateServiceParams,
                    });
                    await prismaInstance.serviceHistory.create({
                        data: {
                            reason,
                            updatedBy,
                            serviceId: service.id,
                            startDate: new Date(),
                            data: JSON.stringify(service),
                            createdBy: service.createdBy,
                        }
                    });

                    return service;
                });

                return resolve(service);
            } catch (error) {
                return reject(error)
            }
        });
    }

    resetService() {
        return new Promise(async (resolve, reject) => {
            try {
                await prisma.clientHistory.deleteMany({});
                await prisma.client.deleteMany({});
                await prisma.serviceHistory.deleteMany({});
                await prisma.service.deleteMany({});
                return resolve('OK');
            } catch (error) {
                return reject(error)
            }
        });
    }
}
