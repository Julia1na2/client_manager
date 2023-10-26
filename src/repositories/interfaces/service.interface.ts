import {
  SaveServiceParams,
  ServiceFilterParams,
  ServiceFilterParamsWithLimits,
  UpdateServiceParams,
} from '../entities/service.entity';

export interface IServiceRepository {
  saveServiceAndHistory(params: SaveServiceParams): Promise<any>;
  retrieveService(params: ServiceFilterParams): Promise<any>
  retrieveServices(params: ServiceFilterParamsWithLimits): Promise<any>;
  retrieveAllServiceHistories(filters: ServiceFilterParamsWithLimits): Promise<any>;
  updateServiceAndHistory(serviceId: number, params: UpdateServiceParams): Promise<any>;
  resetService(): Promise<any>;
}
