import { SQLQueryListResponse } from '../../../commons/types/type';

export class AlertConfiguration {
  id: number;
  sendSlackAlert: boolean;
  sendEmail: boolean;
  createdBy: number;
  emailAddressRecipients?: any;
  serviceId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAlertConfigurationResponse {
  message: string;
  data: AlertConfiguration;
}

export class GetAlertConfigurationsResponse {
  message: string;
  data: SQLQueryListResponse;
}
