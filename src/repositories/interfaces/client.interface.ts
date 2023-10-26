import {
    ClientFilterParams,
    ClientFilterParamsWithLimits,
    SaveClientParams,
    UpdateClientParams
} from "../entities/client.entity";

export interface IClientRepository {
  saveClientAndHistory(params: SaveClientParams): Promise<any>;
  retrieveClient(params: ClientFilterParams): Promise<any>;
  retrieveClients(params: ClientFilterParamsWithLimits): Promise<any>;
  updateClientAndHistory(clientId: number, params: UpdateClientParams): Promise<any>;
}