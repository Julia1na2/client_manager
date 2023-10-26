import {
    AlertConfigurationFilterParams,
    AlertConfigurationFilterParamsWithLimits,
    SaveAlertConfigurationParams,
    UpdateAlertConfigurationParams
} from "../entities/alert-configuration.entity";


export interface IAlertConfigurationRepository {
    saveAlertConfigurationAndHistory(params: SaveAlertConfigurationParams): Promise <any>;
    retrieveAlertConfiguration(params: AlertConfigurationFilterParams): Promise<any>;
    retrieveAlertConfigurations(params: AlertConfigurationFilterParamsWithLimits): Promise<any>;
    retrieveAllAlertConfigurationHistories(filters: AlertConfigurationFilterParamsWithLimits): Promise<any>;
    updateAlertConfigurationAndHistory(alertConfigId: number, params: UpdateAlertConfigurationParams): Promise<any>;
    resetAlertConfiguration(): Promise<any>;
}